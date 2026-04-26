import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  deleteWorkflowDefinition,
  listWorkflowDefinitions,
  saveWorkflowDefinition,
} from '../services/api'

const STATUS_ORDER = ['locked', 'doing', 'done']

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeStatus(status) {
  return STATUS_ORDER.includes(status) ? status : 'locked'
}

function calcProgress(steps) {
  const list = Array.isArray(steps) ? steps : []
  if (list.length === 0) return 0
  const finishedCount = list.filter((step) => normalizeStatus(step.status) === 'done').length
  return Math.round((finishedCount / list.length) * 100)
}

function deriveProjectStatus(steps) {
  const statuses = Array.isArray(steps) ? steps.map((step) => normalizeStatus(step.status)) : []
  if (statuses.length > 0 && statuses.every((status) => status === 'done')) return 'done'
  return statuses.includes('doing') ? 'doing' : 'locked'
}

function createStepListFromDiagram(diagram, meta = {}) {
  const nodeTitles = Array.isArray(diagram?.nodes)
    ? diagram.nodes.map((node) => node.title || node.label || node.id).filter(Boolean)
    : []

  const fallbackSteps = ['Environment Setup', 'API Integration', 'Review & Finish']
  const labels = nodeTitles.length > 0 ? nodeTitles : fallbackSteps
  const now = new Date().toLocaleDateString()

  return labels.map((label, index) => ({
    key: meta.stepKeys?.[index] ?? `step_${index + 1}`,
    label,
    status: index === 0 ? 'doing' : 'locked',
    description:
      index === 0 ? 'Current active step.' : 'Locked until the previous step is approved.',
    updatedAt: now,
    approvedAt: null,
    locked: index !== 0,
  }))
}

function createProjectRecord(flow, index = 0) {
  const now = new Date().toLocaleDateString()
  const diagram = flow?.diagram
    ? clone(flow.diagram)
    : flow?.definition
      ? clone(flow.definition)
      : null
  const providedSteps = Array.isArray(flow?.steps) ? flow.steps : []
  const steps = providedSteps.length > 0 ? providedSteps : createStepListFromDiagram(diagram, flow)
  const normalizedSteps = steps.map((step, stepIndex) => ({
    key: step.key ?? `step_${stepIndex + 1}`,
    label: step.label ?? step.key ?? `Step ${stepIndex + 1}`,
    status: normalizeStatus(step.status),
    description: step.description ?? '',
    updatedAt: step.updatedAt ?? now,
    approvedAt: step.approvedAt ?? null,
    locked: stepIndex > 0 ? (step.locked ?? step.status !== 'doing') : false,
  }))

  if (normalizedSteps.length > 0) {
    normalizedSteps[0].locked = false
    for (let i = 1; i < normalizedSteps.length; i += 1) {
      normalizedSteps[i].status = normalizedSteps[i].status === 'done' ? 'done' : 'locked'
      normalizedSteps[i].locked =
        normalizedSteps[i].status !== 'doing' && normalizedSteps[i].status !== 'done'
    }
  }

  const progress = calcProgress(normalizedSteps)
  const activeStepIndex = normalizedSteps.findIndex((step) => step.status === 'doing')
  const activeStepKey = normalizedSteps[activeStepIndex]?.key ?? normalizedSteps[0]?.key ?? null

  return {
    id: flow?.id ?? `project_${index + 1}`,
    name: flow?.name ?? `Working Flow ${index + 1}`,
    description: flow?.description ?? 'A frozen project snapshot from the editor.',
    status:
      flow?.status === 'done' || progress === 100 ? 'done' : activeStepKey ? 'doing' : 'locked',
    progress,
    createdAt: flow?.createdAt ?? now,
    updatedAt: flow?.updatedAt ?? now,
    flowInfo: flow?.flowInfo ?? {
      source: 'editor',
      nodeCount: Array.isArray(diagram?.nodes) ? diagram.nodes.length : normalizedSteps.length,
      edgeCount: Array.isArray(diagram?.edges) ? diagram.edges.length : 0,
    },
    diagram,
    steps: normalizedSteps,
    activeStepKey,
  }
}

export const useProjectProgressStore = defineStore('projectProgress', () => {
  const projects = ref([])
  const isLoaded = ref(false)
  const loadError = ref(null)

  async function syncProjects() {
    try {
      const records = await listWorkflowDefinitions()
      projects.value = Array.isArray(records)
        ? records.map((record, index) =>
            createProjectRecord(
              {
                id: record.id,
                name: record.name,
                description: record.description,
                status: record.status,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                diagram: record.diagram,
                meta: record.meta,
              },
              index,
            ),
          )
        : []
      isLoaded.value = true
      loadError.value = null
    } catch (error) {
      loadError.value = error
      projects.value = []
    }
  }

  const doneProjects = computed(() => projects.value.filter((project) => project.status === 'done'))
  const doingProjects = computed(() =>
    projects.value.filter((project) => project.status === 'doing'),
  )
  const pendingProjects = computed(() =>
    projects.value.filter((project) => project.status === 'locked'),
  )
  const blockedProjects = computed(() => [])
  const completedCount = computed(() => doneProjects.value.length)
  const overallProgress = computed(() =>
    projects.value.length === 0
      ? 0
      : Math.round((completedCount.value / projects.value.length) * 100),
  )

  function registerProject(flow) {
    const project = createProjectRecord(flow, projects.value.length)
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
    const projectName = meta.name ?? diagram?.meta?.name ?? 'Untitled Flow'
    const saved = await saveWorkflowDefinition({
      id: meta.projectId,
      name: projectName,
      description: meta.description ?? 'Saved from the flowchart editor.',
      definition: diagram,
      nodes: diagram?.nodes ?? [],
      edges: diagram?.edges ?? [],
      meta: {
        ...meta,
        projectName,
      },
    })

    const project = registerProject({
      id: saved.id,
      name: saved.name,
      description: saved.description,
      diagram: saved.definition ?? diagram,
      status: 'doing',
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    })
    return project
  }

  async function loadRuntime(workflowId) {
    const runtime = await getWorkflowRuntime(workflowId)
    if (!runtime) return null
    return runtime
  }

  function getProject(projectId) {
    return projects.value.find((project) => project.id === projectId) ?? null
  }

  function getActiveStep(projectId) {
    const project = getProject(projectId)
    if (!project) return null
    return project.steps.find((step) => step.status === 'doing') ?? null
  }

  function canCallStep(projectId, stepKey) {
    const project = getProject(projectId)
    if (!project) return false
    const activeStep = getActiveStep(projectId)
    return Boolean(activeStep && activeStep.key === stepKey && !activeStep.locked)
  }

  async function updateProjectStep({
    projectId,
    stepKey,
    status,
    stepLabel,
    description,
    approvedAt,
  }) {
    const project = getProject(projectId)
    if (!project) return null

    const currentStep = project.steps.find((item) => item.key === stepKey)
    if (!currentStep) return null

    const currentIndex = project.steps.findIndex((item) => item.key === stepKey)
    const now = new Date().toLocaleDateString()
    const normalizedStatus = normalizeStatus(status)

    if (normalizedStatus === 'done') {
      currentStep.status = 'done'
      currentStep.approvedAt = approvedAt ?? now
      currentStep.updatedAt = now
      currentStep.locked = false

      const nextStep = project.steps[currentIndex + 1]
      if (nextStep) {
        nextStep.status = 'doing'
        nextStep.locked = false
        nextStep.updatedAt = now
        project.activeStepKey = nextStep.key
        project.status = 'doing'
      } else {
        project.activeStepKey = null
        project.status = 'done'
      }
    } else if (normalizedStatus === 'doing') {
      currentStep.status = 'doing'
      currentStep.updatedAt = now
      currentStep.locked = false
      project.activeStepKey = currentStep.key
      project.status = 'doing'
    } else {
      currentStep.status = 'locked'
      currentStep.updatedAt = now
      currentStep.locked = true
      project.status = deriveProjectStatus(project.steps)
    }

    if (stepLabel) currentStep.label = stepLabel
    if (description) currentStep.description = description

    project.progress = calcProgress(project.steps)
    project.updatedAt = now
    return project
  }

  async function approveActiveStep(projectId, stepKey, extra = {}) {
    const project = getProject(projectId)
    if (!project) return null
    const activeStep = getActiveStep(projectId)
    if (!activeStep || activeStep.key !== stepKey) return null
    return updateProjectStep({
      projectId,
      stepKey,
      status: 'done',
      stepLabel: extra.stepLabel,
      description: extra.description,
      approvedAt: extra.approvedAt,
    })
  }

  return {
    projects,
    isLoaded,
    loadError,
    doneProjects,
    doingProjects,
    pendingProjects,
    blockedProjects,
    completedCount,
    overallProgress,
    syncProjects,
    registerProject,
    deleteProject,
    upsertProjectFromDiagram,
    loadRuntime,
    getProject,
    getActiveStep,
    canCallStep,
    updateProjectStep,
    approveActiveStep,
  }
})
