<template>
  <main class="my-center-page">
    <aside class="my-center-sidebar">
      <RouterLink class="sidebar-brand" to="/">
        <Boxes :size="24" />
        <span>My Center</span>
      </RouterLink>

      <nav class="sidebar-nav" aria-label="My Center navigation">
        <a class="sidebar-nav__item is-active" href="#saved-flows">
          <FolderKanban :size="18" />
          <span>Saved flows</span>
        </a>
        <a class="sidebar-nav__item" href="#settings">
          <Settings :size="18" />
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-user">
        <span class="sidebar-user__avatar">U</span>
        <div>
          <strong>Username</strong>
          <span>user@example.com</span>
        </div>
        <ChevronDown :size="16" />
      </div>
    </aside>

    <section id="saved-flows" class="my-center-workspace">
      <MyCenterHero />

      <section class="projects-grid">
        <ProjectListPanel
          :projects="projects"
          :selected-project-id="selectedProjectId"
          :is-workflow-complete="isWorkflowComplete"
          :workflow-completed-at="workflowCompletedAt"
          :approved-step-count="approvedStepCount"
          @select-project="selectedProjectId = $event"
          @delete-project="handleDeleteProject"
        />

        <ProjectDetailPanel
          v-if="selectedProject"
          :selected-project="selectedProject"
          :active-step="activeStep"
          :project-steps="projectSteps"
          :api-modules="selectedProjectApiModules"
          :copied-api-url="copiedApiUrl"
          @copy-api-url="copyApiUrl"
        />
      </section>
    </section>

    <Teleport to="body">
      <div v-if="projectPendingDelete" class="delete-modal-backdrop" @click.self="cancelDeleteProject">
        <section class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div class="delete-modal__icon">!</div>
          <div class="delete-modal__content">
            <p class="eyebrow eyebrow--danger">Delete project</p>
            <h2 id="delete-modal-title">Remove this working flow?</h2>
            <p>
              You are about to delete <strong>{{ projectPendingDelete.name }}</strong>. This action cannot be undone.
            </p>
          </div>
          <div class="delete-modal__actions">
            <button class="delete-modal__btn delete-modal__btn--ghost" type="button" @click="cancelDeleteProject">
              Cancel
            </button>
            <button class="delete-modal__btn delete-modal__btn--danger" type="button" @click="confirmDeleteProject">
              Delete flow
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Boxes, ChevronDown, FolderKanban, Settings } from 'lucide-vue-next'

import MyCenterHero from '../components/mycenter/MyCenterHero.vue'
import ProjectDetailPanel from '../components/mycenter/ProjectDetailPanel.vue'
import ProjectListPanel from '../components/mycenter/ProjectListPanel.vue'
import '../styles/myCenter.css'
import { useProjectProgressStore } from '../stores/projectProgress'
import { getActiveNodeIds, orderWorkflowNodes } from '../tools/workflowOrder'

const progressStore = useProjectProgressStore()
const { projects } = storeToRefs(progressStore)
const selectedProjectId = ref(null)
const projectPendingDelete = ref(null)

const selectedProject = computed(
  () =>
    projects.value.find((project) => project.id === selectedProjectId.value) ??
    projects.value[0] ??
    null,
)

const copiedApiUrl = ref('')
let copiedTimer = null

async function copyApiUrl(text) {
  try {
    await navigator.clipboard?.writeText(text)
    copiedApiUrl.value = text
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copiedApiUrl.value = ''
    }, 1400)
  } catch {
    copiedApiUrl.value = ''
  }
}

const runtimeState = computed(() => {
  const runtime = selectedProject.value?.runtime
  const state = runtime?.runtimeState ?? {}
  const completedNodeIds = Array.isArray(state?.completedNodeIds) ? state.completedNodeIds : []
  const currentNodeIds = Array.isArray(state?.currentNodeIds) ? state.currentNodeIds : []
  const currentNodeId = runtime?.currentNodeId ?? state?.currentNodeId ?? null

  return {
    completedNodeIds,
    currentNodeIds,
    currentNodeId,
    status: runtime?.status ?? 'not_started',
    updatedAt: runtime?.updatedAt ?? selectedProject.value?.updatedAt ?? '-',
  }
})

const projectSteps = computed(() => {
  const nodes = orderWorkflowNodes(selectedProject.value?.diagram ?? {})
  const completedNodeIds = new Set(runtimeState.value.completedNodeIds)
  const activeNodeIds = getActiveNodeIds(runtimeState.value)

  return nodes.map((node) => {
    const nodeId = node.id
    const status = completedNodeIds.has(nodeId)
      ? 'completed'
      : activeNodeIds.has(String(nodeId))
        ? 'active'
        : 'not_started'

    return {
      key: node.code ?? node.id,
      nodeId,
      label: node.title ?? node.label ?? node.id,
      status,
      updatedAt: runtimeState.value.updatedAt,
    }
  })
})

const selectedProjectApiModules = computed(() => {
  const definition = selectedProject.value?.definition ?? selectedProject.value?.diagram ?? {}
  const nodes = orderWorkflowNodes(definition)
  const triggerMap = selectedProject.value?.triggerMap ?? {}
  const workflowId = selectedProject.value?.id
  const completedNodeIds = new Set(runtimeState.value.completedNodeIds)
  const activeNodeIds = getActiveNodeIds(runtimeState.value)

  return nodes
    .map((node) => {
      const code = node.code ?? node.id
      const fallbackUrl = `/workflow/${workflowId}/module/${code}/trigger`
      const triggerUrl = triggerMap?.[code] ?? fallbackUrl
      const nodeId = node.id
      const status = completedNodeIds.has(nodeId)
        ? 'completed'
        : activeNodeIds.has(String(nodeId))
          ? 'active'
          : 'not_started'

      return {
        code,
        label: node.title ?? node.label ?? node.id,
        status,
        requiredFieldsText: (node.workflow?.requiredFields ?? []).join(', ') || '-',
        triggerUrl,
      }
    })
    .filter((module) => Boolean(module.code))
})

const approvedStepCount = computed(
  () => projectSteps.value.filter((step) => step.status === 'completed').length,
)
const isWorkflowComplete = computed(
  () => projectSteps.value.length > 0 && approvedStepCount.value === projectSteps.value.length,
)
const workflowCompletedAt = computed(() =>
  isWorkflowComplete.value ? runtimeState.value.updatedAt : '-',
)
const activeStep = computed(
  () => projectSteps.value.find((step) => step.status === 'active') ?? null,
)

function handleDeleteProject(project) {
  projectPendingDelete.value = project
}

function cancelDeleteProject() {
  projectPendingDelete.value = null
}

async function confirmDeleteProject() {
  const project = projectPendingDelete.value
  if (!project) return

  const deleted = await progressStore.deleteProject(project.id)
  if (deleted && selectedProjectId.value === project.id) {
    selectedProjectId.value = projects.value[0]?.id ?? null
  }
  projectPendingDelete.value = null
}

watch(
  () => projects.value.length,
  () => {
    if (!selectedProjectId.value && projects.value[0]) {
      selectedProjectId.value = projects.value[0].id
    }
  },
)

onMounted(async () => {
  if (!progressStore.isLoaded) {
    await progressStore.syncProjects()
  }
  selectedProjectId.value = projects.value[0]?.id ?? null
})

defineOptions({
  name: 'MyCenterPage',
})
</script>
