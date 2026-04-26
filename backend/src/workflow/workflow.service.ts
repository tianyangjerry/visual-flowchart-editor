import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { TriggerWorkflowModuleDto } from './dto/trigger-workflow-module.dto'
import { UpsertWorkflowDefinitionDto } from './dto/upsert-workflow-definition.dto'

function asJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function buildTriggerMap(definition: Record<string, unknown>) {
  const nodes = asArray<Record<string, unknown>>(definition.nodes)
  const projectId = String(definition.id ?? '')
  const triggerMap: Record<string, string> = {}

  for (const node of nodes) {
    const nodeId = String(node.id ?? '')
    const moduleCode = String(node.code ?? nodeId)
    if (!nodeId || !moduleCode) continue
    triggerMap[moduleCode] = `/workflow/${projectId}/module/${moduleCode}/trigger`
  }

  return triggerMap
}

function getNodeCode(node: Record<string, unknown>) {
  return String(node.code ?? node.id ?? '')
}

function getNodeRequiredFields(node: Record<string, unknown>) {
  const workflow = (node.workflow as Record<string, unknown> | undefined) ?? {}
  return asArray<string>(workflow.requiredFields)
}

function getNodeTriggerMode(node: Record<string, unknown>) {
  const workflow = (node.workflow as Record<string, unknown> | undefined) ?? {}
  return String(workflow.triggerMode ?? 'manual')
}

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma as PrismaService & Record<string, any>
  }

  async listDefinitions() {
    try {
      return await this.db.workflowDefinition.findMany({ orderBy: { updatedAt: 'desc' } })
    } catch {
      return []
    }
  }

  async getDefinition(id: string) {
    const definition = await this.db.workflowDefinition.findUnique({ where: { id } })
    if (!definition) throw new NotFoundException('Workflow definition not found')
    return definition
  }

  async upsertDefinition(dto: UpsertWorkflowDefinitionDto) {
    const id = dto.id?.trim()
    const definition = {
      id: id ?? undefined,
      name: dto.name?.trim() || 'Untitled Workflow',
      description: dto.description?.trim() || '',
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      ...(dto.definition ?? {}),
    }
    const triggerMap = buildTriggerMap(definition)

    if (!id) {
      return this.db.workflowDefinition.create({
        data: {
          name: definition.name,
          description: definition.description,
          definition: asJson(definition),
          triggerMap: asJson(triggerMap),
        },
      })
    }

    return this.db.workflowDefinition.upsert({
      where: { id },
      create: {
        id,
        name: definition.name,
        description: definition.description,
        definition: asJson(definition),
        triggerMap: asJson(triggerMap),
      },
      update: {
        name: definition.name,
        description: definition.description,
        definition: asJson(definition),
        triggerMap: asJson(triggerMap),
      },
    })
  }

  async getRuntime(workflowId: string) {
    const runtime = await this.db.workflowRuntime.findFirst({
      where: { workflowId },
      orderBy: { updatedAt: 'desc' },
    })
    if (!runtime) throw new NotFoundException('Workflow runtime not found')
    return runtime
  }

  async ensureRuntime(workflowId: string) {
    const existing = await this.db.workflowRuntime.findFirst({ where: { workflowId } })
    if (existing) return existing

    const definition = await this.getDefinition(workflowId)
    const definitionJson = definition.definition as Record<string, unknown>
    const nodes = asArray<Record<string, unknown>>(definitionJson.nodes)
    const firstNode = nodes[0]
    const firstNodeId = firstNode ? String(firstNode.id ?? '') : null

    return this.db.workflowRuntime.create({
      data: {
        workflowId,
        status: 'not_started',
        currentNodeId: firstNodeId,
        runtimeState: asJson({ currentNodeId: firstNodeId, completedNodeIds: [], events: [] }),
      },
    })
  }

  async triggerModule(workflowId: string, moduleCode: string, dto: TriggerWorkflowModuleDto) {
    const definition = await this.getDefinition(workflowId)
    const runtime = await this.ensureRuntime(workflowId)
    const definitionJson = definition.definition as Record<string, unknown>
    const triggerMap = (definition.triggerMap as Record<string, string> | null) ?? {}
    const triggerIdentity = triggerMap[moduleCode]

    if (!triggerIdentity) {
      throw new NotFoundException('Module not found in workflow')
    }

    const nodes = asArray<Record<string, unknown>>(definitionJson.nodes)
    const node = nodes.find((item) => getNodeCode(item) === moduleCode)
    if (!node) {
      throw new NotFoundException('Node not found in workflow definition')
    }

    const runtimeState = (runtime.runtimeState as Record<string, unknown>) ?? {}
    const completedNodeIds = asArray<string>(runtimeState.completedNodeIds)
    const currentNodeId = String(runtime.currentNodeId ?? runtimeState.currentNodeId ?? '')
    const expectedCurrentNode = nodes.find((item) => String(item.id ?? '') === currentNodeId)

    if (expectedCurrentNode && getNodeCode(expectedCurrentNode) !== moduleCode) {
      throw new BadRequestException('This module is not currently active')
    }

    if (completedNodeIds.includes(String(node.id ?? ''))) {
      throw new BadRequestException('This module has already been completed')
    }

    const requiredFields = getNodeRequiredFields(node)
    const payload = dto.payload ?? {}
    const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '')

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`)
    }

    const nodeIndex = nodes.findIndex((item) => getNodeCode(item) === moduleCode)
    const nextNode = nodes[nodeIndex + 1] ?? null
    const nextNodeId = nextNode ? String(nextNode.id ?? '') : null
    const nextCompleted = [...new Set([...completedNodeIds, String(node.id ?? '')])]
    const nextStatus = nextNode ? 'not_started' : 'completed'

    const result = {
      workflowId,
      moduleCode,
      triggerIdentity,
      eventType: dto.eventType ?? 'trigger',
      payload,
      completedNodeIds: nextCompleted,
      currentNodeId: nextNodeId,
      status: nextStatus,
      currentNodeStatus: nextNode ? 'active' : 'completed',
      nextNodeId,
    }

    await this.db.workflowRuntime.update({
      where: { id: runtime.id },
      data: {
        status: nextNode ? 'active' : 'completed',
        currentNodeId: nextNodeId,
        runtimeState: asJson({
          ...(runtimeState as Record<string, unknown>),
          currentNodeId: nextNodeId,
          completedNodeIds: nextCompleted,
          lastTriggeredModule: moduleCode,
          lastEventType: dto.eventType ?? 'trigger',
          lastPayload: payload,
          lastTriggerIdentity: triggerIdentity,
          lastResult: result,
        }),
      },
    })

    await this.db.workflowRuntimeEvent.create({
      data: {
        runtimeId: runtime.id,
        moduleCode,
        eventType: dto.eventType ?? 'trigger',
        payload: asJson(payload),
        result: asJson(result),
      },
    })

    return result
  }
}
