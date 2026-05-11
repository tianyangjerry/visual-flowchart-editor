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

function getNodeId(node: Record<string, unknown>) {
  return String(node.id ?? '')
}

function normalizeText(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function isStartNode(node: Record<string, unknown>) {
  const style = (node.style as Record<string, unknown> | undefined) ?? {}
  return (
    node.type === 'start' ||
    normalizeText(node.title) === 'start' ||
    normalizeText(node.label) === 'start' ||
    normalizeText(node.code) === 'start' ||
    (node.terminalKind === 'start' && ['start', 'startEnd'].includes(String(style.variant ?? '')))
  )
}

function normalizeWorkflowNode(node: Record<string, unknown>) {
  const normalizedNode = { ...node }
  if (normalizedNode.type === 'start' || normalizedNode.type === 'end') {
    normalizedNode.terminalKind = normalizedNode.type
  } else {
    delete normalizedNode.terminalKind
  }
  return normalizedNode
}

function normalizeWorkflowDefinition(definition: Record<string, unknown>): Record<string, unknown> {
  return {
    ...definition,
    nodes: asArray<Record<string, unknown>>(definition.nodes).map(normalizeWorkflowNode),
    edges: asArray<Record<string, unknown>>(definition.edges),
  }
}

function getNodePosition(node: Record<string, unknown>, field: 'x' | 'y') {
  const layout = (node.layout as Record<string, unknown> | undefined) ?? {}
  const value = Number(layout[field] ?? 0)
  return Number.isFinite(value) ? value : 0
}

function compareNodesByPosition(aNode: Record<string, unknown>, bNode: Record<string, unknown>) {
  const yDelta = getNodePosition(aNode, 'y') - getNodePosition(bNode, 'y')
  if (yDelta !== 0) return yDelta

  const xDelta = getNodePosition(aNode, 'x') - getNodePosition(bNode, 'x')
  if (xDelta !== 0) return xDelta

  return getNodeId(aNode).localeCompare(getNodeId(bNode))
}

function buildWorkflowGraph(definition: Record<string, unknown>) {
  const nodes = asArray<Record<string, unknown>>(definition.nodes)
  const edges = asArray<Record<string, unknown>>(definition.edges)
  const nodeMap = new Map<string, Record<string, unknown>>()
  const incomingMap = new Map<string, string[]>()
  const outgoingMap = new Map<string, string[]>()

  for (const node of nodes) {
    const nodeId = getNodeId(node)
    if (nodeId) nodeMap.set(nodeId, node)
  }

  for (const nodeId of nodeMap.keys()) {
    incomingMap.set(nodeId, [])
    outgoingMap.set(nodeId, [])
  }

  for (const edge of edges) {
    const sourceId = String(edge.source ?? '')
    const targetId = String(edge.target ?? '')
    if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) continue

    outgoingMap.get(sourceId)?.push(targetId)
    incomingMap.get(targetId)?.push(sourceId)
  }

  for (const [sourceId, targetIds] of outgoingMap) {
    const sortedTargets = [...new Set(targetIds)].sort((aId, bId) =>
      compareNodesByPosition(nodeMap.get(aId) ?? {}, nodeMap.get(bId) ?? {}),
    )
    outgoingMap.set(sourceId, sortedTargets)
  }

  return { incomingMap, nodeMap, nodes, outgoingMap }
}

function getInitialNodeIds(definition: Record<string, unknown>) {
  const graph = buildWorkflowGraph(definition)
  const startNode = graph.nodes.filter(isStartNode).sort(compareNodesByPosition)[0]
  if (startNode) return [getNodeId(startNode)].filter(Boolean)

  const rootNode = graph.nodes
    .filter((node) => (graph.incomingMap.get(getNodeId(node)) ?? []).length === 0)
    .sort(compareNodesByPosition)[0]
  if (rootNode) return [getNodeId(rootNode)].filter(Boolean)

  const firstNodeId = graph.nodes[0] ? getNodeId(graph.nodes[0]) : ''
  return firstNodeId ? [firstNodeId] : []
}

function getActiveNodeIds(runtime: Record<string, unknown>, runtimeState: Record<string, unknown>) {
  const stateCurrentNodeIds = asArray<string>(runtimeState.currentNodeIds)
  const currentNodeId = String(runtime.currentNodeId ?? runtimeState.currentNodeId ?? '')
  return [...new Set([...stateCurrentNodeIds, currentNodeId].filter(Boolean))]
}

function getReadyNextNodeIds(
  definition: Record<string, unknown>,
  completedNodeIds: Set<string>,
  completedSourceNodeId: string,
) {
  const graph = buildWorkflowGraph(definition)
  const targetIds = graph.outgoingMap.get(completedSourceNodeId) ?? []

  return targetIds.filter((targetId) => {
    if (completedNodeIds.has(targetId)) return false

    const incomingSourceIds = graph.incomingMap.get(targetId) ?? []
    return incomingSourceIds.every((sourceId) => completedNodeIds.has(sourceId))
  })
}

function buildTriggerMap(workflowId: string, definition: Record<string, unknown>) {
  const nodes = asArray<Record<string, unknown>>(definition.nodes)
  const triggerMap: Record<string, string> = {}

  for (const node of nodes) {
    const nodeId = String(node.id ?? '')
    const moduleCode = String(node.code ?? nodeId)
    if (!nodeId || !moduleCode) continue
    triggerMap[moduleCode] = `/workflow/${workflowId}/module/${moduleCode}/trigger`
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
      const definitions = await this.db.workflowDefinition.findMany({ orderBy: { updatedAt: 'desc' } })
      const workflowIds = definitions.map((item: { id: string }) => item.id)
      const runtimes = workflowIds.length
        ? await this.db.workflowRuntime.findMany({ where: { workflowId: { in: workflowIds } } })
        : []
      const runtimeMap = new Map(runtimes.map((runtime: any) => [runtime.workflowId, runtime]))

      return definitions.map((definition: any) => ({
        ...definition,
        runtime: runtimeMap.get(definition.id) ?? null,
      }))
    } catch {
      return []
    }
  }

  async getDefinition(id: string) {
    const definition = await this.db.workflowDefinition.findUnique({ where: { id } })
    if (!definition) throw new NotFoundException('Workflow definition not found')

    const runtime = await this.db.workflowRuntime.findFirst({ where: { workflowId: id } })
    return {
      ...definition,
      runtime: runtime ?? null,
    }
  }

  async upsertDefinition(dto: UpsertWorkflowDefinitionDto) {
    const incomingId = dto.id?.trim()
    const baseDefinition = normalizeWorkflowDefinition({
      id: incomingId ?? undefined,
      name: dto.name?.trim() || 'Untitled Workflow',
      description: dto.description?.trim() || '',
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      ...(dto.definition ?? {}),
    })
    const definitionName = String(baseDefinition.name ?? 'Untitled Workflow')
    const definitionDescription = String(baseDefinition.description ?? '')

    let saved

    if (!incomingId) {
      saved = await this.db.workflowDefinition.create({
        data: {
          name: definitionName,
          description: definitionDescription,
          definition: asJson(baseDefinition),
          triggerMap: asJson({}),
        },
      })
    } else {
      saved = await this.db.workflowDefinition.upsert({
        where: { id: incomingId },
        create: {
          id: incomingId,
          name: definitionName,
          description: definitionDescription,
          definition: asJson(baseDefinition),
          triggerMap: asJson({}),
        },
        update: {
          name: definitionName,
          description: definitionDescription,
          definition: asJson(baseDefinition),
        },
      })
    }

    const workflowId = saved.id
    const finalDefinition = {
      ...baseDefinition,
      id: workflowId,
    }
    const triggerMap = buildTriggerMap(workflowId, finalDefinition)

    await this.db.workflowDefinition.update({
      where: { id: workflowId },
      data: {
        definition: asJson(finalDefinition),
        triggerMap: asJson(triggerMap),
      },
    })

    await this.ensureRuntime(workflowId)
    return this.getDefinition(workflowId)
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
    const definition = await this.getDefinition(workflowId)
    const definitionJson = definition.definition as Record<string, unknown>
    const initialNodeIds = getInitialNodeIds(definitionJson)
    const firstNodeId = initialNodeIds[0] ?? null

    if (existing) {
      const runtimeState = (existing.runtimeState as Record<string, unknown>) ?? {}
      const completedNodeIds = asArray<string>(runtimeState.completedNodeIds)
      const activeNodeIds = getActiveNodeIds(existing, runtimeState)
      const hasCurrentNodeIds = asArray<string>(runtimeState.currentNodeIds).length > 0
      const shouldRefreshInitialState =
        completedNodeIds.length === 0 &&
        firstNodeId &&
        (!hasCurrentNodeIds || activeNodeIds.length === 0 || activeNodeIds.some((nodeId) => !initialNodeIds.includes(nodeId)))

      if (!shouldRefreshInitialState) return existing

      return this.db.workflowRuntime.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          currentNodeId: firstNodeId,
          runtimeState: asJson({
            ...(runtimeState as Record<string, unknown>),
            currentNodeId: firstNodeId,
            currentNodeIds: initialNodeIds,
            completedNodeIds,
          }),
        },
      })
    }

    return this.db.workflowRuntime.create({
      data: {
        workflowId,
        status: firstNodeId ? 'active' : 'not_started',
        currentNodeId: firstNodeId,
        runtimeState: asJson({
          currentNodeId: firstNodeId,
          currentNodeIds: initialNodeIds,
          completedNodeIds: [],
          events: [],
        }),
      },
    })
  }

  async removeDefinition(id: string) {
    const definition = await this.db.workflowDefinition.findUnique({ where: { id } })
    if (!definition) {
      throw new NotFoundException('Workflow definition not found')
    }
    await this.db.workflowDefinition.delete({ where: { id } })
    return { ok: true }
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
    const activeNodeIds = getActiveNodeIds(runtime, runtimeState)
    const nodeId = getNodeId(node)

    if (activeNodeIds.length > 0 && !activeNodeIds.includes(nodeId)) {
      throw new BadRequestException('This module is not currently active')
    }

    if (completedNodeIds.includes(nodeId)) {
      throw new BadRequestException('This module has already been completed')
    }

    const requiredFields = getNodeRequiredFields(node)
    const payload = dto.payload ?? {}
    const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '')

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`)
    }

    const nextCompleted = [...new Set([...completedNodeIds, nodeId])]
    const completedNodeIdSet = new Set(nextCompleted)
    const remainingActiveNodeIds = activeNodeIds.filter((activeNodeId) => activeNodeId !== nodeId && !completedNodeIdSet.has(activeNodeId))
    const readyNextNodeIds = getReadyNextNodeIds(definitionJson, completedNodeIdSet, nodeId)
    const nextActiveNodeIds = [...new Set([...remainingActiveNodeIds, ...readyNextNodeIds])]
    const nextNodeId = nextActiveNodeIds[0] ?? null
    const nextStatus = nextActiveNodeIds.length > 0 ? 'active' : 'completed'

    const result = {
      workflowId,
      moduleCode,
      triggerIdentity,
      eventType: dto.eventType ?? 'trigger',
      payload,
      completedNodeIds: nextCompleted,
      currentNodeId: nextNodeId,
      currentNodeIds: nextActiveNodeIds,
      status: nextStatus,
      currentNodeStatus: nextActiveNodeIds.length > 0 ? 'active' : 'completed',
      nextNodeId,
      nextNodeIds: nextActiveNodeIds,
    }

    await this.db.workflowRuntime.update({
      where: { id: runtime.id },
      data: {
        status: nextStatus,
        currentNodeId: nextNodeId,
        runtimeState: asJson({
          ...(runtimeState as Record<string, unknown>),
          currentNodeId: nextNodeId,
          currentNodeIds: nextActiveNodeIds,
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
