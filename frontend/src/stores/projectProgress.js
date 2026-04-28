import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { deleteWorkflowDefinition, getWorkflowRuntime, listWorkflowDefinitions, saveWorkflowDefinition } from '../services/api'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeRuntimeStatus(status) {
  return ['not_started', 'active', 'completed', 'blocked'].includes(status) ? status : 'not_started'
}

function buildStepsFromDefinitionAndRuntime(definition = {}, runtime = null) {
  const nodes = Array.isArray(definition?.nodes) ? definition.nodes : []
  const runtimeState = runtime?.runtimeState ?? {}
  const completedNodeIds = Array.isArray(runtimeState.completedNodeIds) ? runtimeState.completedNodeIds : []
  const currentNodeId = runtime?.currentNodeId ?? runtimeState.currentNodeId ?? null

  return nodes.map((node, index) => {
    const nodeId = node.id ?? `node_${index + 1}`
    const isCompleted = completedNodeIds.includes(nodeId)
    const isActive = currentNodeId && currentNodeId === nodeId
    const status = isCompleted ? 'completed' : isActive ? 'active' : 'not_started'

    return {
      key: node.code ?? node.id ?? `step_${index + 1}`,
      nodeId,
      label: node.title ?? node.label ?? node.id ?? `Step ${index + 1}`,
      status,
      updatedAt: runtime?.updatedAt ?? definition?.updatedAt ?? new Date().toLocaleDateString(),
      completedAt: isCompleted ? runtime?.updatedAt ?? null : null,
    }
  })
}

function createProjectRecord(record, index = 0) {
  const definition = record?.definition ? clone(record.definition) : { nodes: [], edges: [] }
  const runtime = record?.runtime ?? null
  const steps = buildStepsFromDefinitionAndRuntime(definition, runtime)
  const completedCount = steps.filter((s) => s.status === 'completed').length
  const progress = steps.length ? Math.round((completedCount / steps.length) * 100) : 0

  return {
    id: record?.id ?? `project_${index + 1}`,
    name: record?.name ?? `Workflow ${index + 1}`,
    description: record?.description ?? 'Workflow definition from backend.',
    status: normalizeRuntimeStatus(runtime?.status),
    progress,
    createdAt: record?.createdAt ?? new Date().toLocaleDateString(),
    updatedAt: runtime?.updatedAt ?? record?.updatedAt ?? new Date().toLocaleDateString(),
    diagram: definition,
    triggerMap: record?.triggerMap ?? {},
    runtime,
    steps,
    activeStepKey: steps.find((s) => s.status === 'active')?.key ?? null,
  }
}

export const useProjectProgressStore = defineStore('projectProgress', () => {
  const projects = ref([])
  const isLoaded = ref(false)
  const loadError = ref(null)

  async function syncProjects() {
    try {
      const records = await listWorkflowDefinitions()
      projects.value = Array.isArray(records) ? records.map((record, index) => createProjectRecord(record, index)) : []
      isLoaded.value = true
      loadError.value = null
    } catch (error) {
      loadError.value = error
      projects.value = []
    }
  }

  function registerProject(record) {
    const project = createProjectRecord(record, projects.value.length)
    const index = projects.value.findIndex((item) => item.id === project.id)
    if (index === -1) projects.value.unshift(project)
    else projects.value[index] = project
    return project
  }

  async function deleteProject(projectId) {
    const index = projects.value.findIndex((project) => project.id === projectId)
    if (index === -1) return false
    await deleteWorkflowDefinition(projectId)
    projects.value.splice(index, 1)
    return true
  }

  async function upsertProjectFromDiagram(diagram, meta = {}) {
    const projectName = meta.name ?? diagram?.meta?.name ?? 'Untitled Workflow'
    const saved = await saveWorkflowDefinition({
      id: meta.projectId,
      name: projectName,
      description: meta.description ?? 'Saved from the workflow editor.',
      definition: diagram,
      nodes: diagram?.nodes ?? [],
      edges: diagram?.edges ?? [],
    })
    return registerProject(saved)
  }

  async function loadRuntime(workflowId) {
    return getWorkflowRuntime(workflowId)
  }

  const completedCount = computed(() => projects.value.filter((p) => p.status === 'completed').length)
  const overallProgress = computed(() => (projects.value.length ? Math.round((completedCount.value / projects.value.length) * 100) : 0))

  return {
    projects,
    isLoaded,
    loadError,
    completedCount,
    overallProgress,
    syncProjects,
    registerProject,
    deleteProject,
    upsertProjectFromDiagram,
    loadRuntime,
  }
})
