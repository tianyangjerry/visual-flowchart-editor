import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpsertFlowchartDto } from './dto/upsert-flowchart.dto'

function normalizeDiagram(dto: UpsertFlowchartDto) {
  if (dto.diagram) return dto.diagram
  return {
    schemaVersion: 2,
    nodes: dto.nodes ?? [],
    edges: dto.edges ?? [],
    viewport: dto.viewport ?? { x: 0, y: 0, zoom: 1 },
  }
}

function normalizeStatus(status?: string) {
  if (status === 'doing' || status === 'done' || status === 'locked') {
    return status
  }
  return 'locked'
}

@Injectable()
export class FlowchartsService {
  constructor(private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma as unknown as {
      workflowDefinition: {
        findMany: (args: unknown) => Promise<unknown[]>
        findUnique: (args: unknown) => Promise<unknown | null>
        create: (args: unknown) => Promise<unknown>
        upsert: (args: unknown) => Promise<unknown>
        delete: (args: unknown) => Promise<unknown>
      }
    }
  }

  async list() {
    try {
      return await this.db.workflowDefinition.findMany({ orderBy: { updatedAt: 'desc' } })
    } catch {
      return []
    }
  }

  async getById(id: string) {
    const flowchart = await this.db.workflowDefinition.findUnique({ where: { id } })
    if (!flowchart) throw new NotFoundException('Flowchart not found')
    return flowchart
  }

  async upsert(dto: UpsertFlowchartDto) {
    const id = dto.id?.trim()
    const diagram = normalizeDiagram(dto)
    const data = {
      ...(id ? { id } : {}),
      name: dto.name?.trim() || 'Untitled Flow',
      description: dto.description?.trim() || '',
      status: normalizeStatus(dto.status),
      definition: diagram,
      triggerMap: {},
    }

    if (!id) {
      return this.db.workflowDefinition.create({ data })
    }

    return this.db.workflowDefinition.upsert({
      where: { id },
      create: data,
      update: {
        name: data.name,
        description: data.description,
        definition: diagram,
        triggerMap: {},
      },
    })
  }

  async remove(id: string) {
    await this.getById(id)
    return this.db.workflowDefinition.delete({ where: { id } })
  }
}
