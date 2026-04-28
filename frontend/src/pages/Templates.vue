<template>
  <main class="my-center-page">
    <header class="hero-shell">
      <div>
        <p class="eyebrow">My Center</p>
        <h1>Saved working flows</h1>
        <p class="hero-copy">
          Manage your saved projects here. Open a flow, inspect its details, or remove it when you
          no longer need it.
        </p>
      </div>

      <RouterLink class="hero-action" to="/editor">Open Editor</RouterLink>
    </header>

    <section class="projects-grid">
      <article class="project-list-shell">
        <div v-if="isWorkflowComplete" class="completion-banner">
          <div>
            <p class="eyebrow eyebrow--success">Workflow completed</p>
            <h2>All modules have completed successfully.</h2>
          </div>
          <div class="completion-banner__meta">
            <span>Completed on: {{ workflowCompletedAt }}</span>
            <span>Total steps completed: {{ approvedStepCount }}</span>
          </div>
        </div>

        <div class="section-head">
          <div>
            <p class="eyebrow">Projects</p>
            <h2>Project cards</h2>
          </div>
          <span class="count-chip">{{ projects.length }} projects</span>
        </div>

        <div v-if="projects.length" class="project-list">
          <RouterLink
            v-for="project in projects"
            :key="project.id"
            class="project-card project-card--link"
            :class="{ active: project.id === selectedProjectId }"
            :to="{ path: '/editor', query: { flowchartId: project.id } }"
            @click="selectedProjectId = project.id"
          >
            <button
              class="delete-btn"
              type="button"
              aria-label="Delete project"
              @click.stop="handleDeleteProject(project)"
            >
              <Trash2 :size="14" />
            </button>

            <div class="project-card__header">
              <strong>{{ project.name }}</strong>
            </div>
            <div class="project-card__subheader">
              <span class="status-pill" :class="`status-${project.status}`">{{ project.status }}</span>
            </div>
            <p>{{ project.description }}</p>
            <div class="project-card__meta">
              <span>Progress {{ project.progress }}%</span>
              <span>{{ project.updatedAt }}</span>
            </div>
          </RouterLink>
        </div>

        <div v-else class="empty-state">
          <h3>No projects yet</h3>
          <p>Save a flowchart from the editor and it will appear here.</p>
        </div>
      </article>

      <article v-if="selectedProject" class="detail-shell">
        <div class="section-head">
          <div>
            <p class="eyebrow">Project detail</p>
            <h2>{{ selectedProject.name }}</h2>
          </div>
          <span class="status-pill status-active">{{ selectedProject.status }}</span>
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <span class="detail-label">Last updated</span>
            <strong>{{ selectedProject.updatedAt }}</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Active step</span>
            <strong>{{ activeStep?.label ?? 'Completed' }}</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Progress</span>
            <strong>{{ selectedProject.progress }}%</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Flow source</span>
            <strong>{{ selectedProject.flowInfo?.source ?? 'editor' }}</strong>
          </div>
        </div>

        <details class="api-shell" open>
          <summary class="api-shell__summary">
            <div class="section-head compact">
              <div>
                <p class="eyebrow">External API</p>
                <h3>Modules should be triggered by external systems through these endpoints</h3>
              </div>
            </div>
          </summary>

          <div v-if="selectedProjectApiModules.length" class="api-list">
            <article v-for="module in selectedProjectApiModules" :key="module.code" class="api-card">
              <div class="api-card__header">
                <div>
                  <p class="api-card__label">Module name</p>
                  <strong>{{ module.label }}</strong>
                </div>
                <button class="api-copy-btn" type="button" @click="copyApiUrl(module.triggerUrl)">
                  {{ copiedApiUrl === module.triggerUrl ? 'Copied' : 'Copy' }}
                </button>
              </div>
              <div class="api-card__row">
                <span class="api-card__label">Module code</span>
                <strong>{{ module.code }}</strong>
              </div>
              <div class="api-card__row">
                <span class="api-card__label">Status</span>
                <span class="status-pill" :class="module.status === 'active' ? 'status-active' : module.status === 'completed' ? 'status-completed' : 'status-not-started'">
                  {{ module.status }}
                </span>
              </div>
              <div class="api-card__row api-card__row--stacked">
                <span class="api-card__label">Trigger URL</span>
                <code class="api-card__url">{{ module.triggerUrl }}</code>
                <div class="api-card__example">
                  <span>Example API</span>
                  <code>POST {{ module.triggerUrl }}</code>
                </div>
              </div>
              <div class="api-card__row">
                <span class="api-card__label">Required fields</span>
                <span>{{ module.requiredFieldsText }}</span>
              </div>
            </article>
          </div>

          <p v-else class="empty-inline">No API modules configured yet.</p>
        </details>

        <div class="snapshot-shell">
          <div class="section-head compact">
            <div>
              <p class="eyebrow">Frozen flow snapshot</p>
              <h3>Editor scale preview</h3>
            </div>
          </div>
          <ProjectFlowSnapshot :project="selectedProject" />
        </div>

        <div class="step-list-shell">
          <div class="section-head">
            <div>
              <p class="eyebrow">Runtime</p>
              <h2>Module execution state</h2>
            </div>
            <span class="count-chip">{{ projectSteps.length }} steps</span>
          </div>

          <div class="step-list">
            <article
              v-for="step in projectSteps"
              :key="step.key"
              class="step-card"
              :class="[`step-card--${step.status}`, { 'is-active': activeStep?.key === step.key } ]"
            >
              <div class="step-card__grid">
                <div class="step-card__main">
                  <div class="step-card__topline">
                    <strong class="step-card__title">{{ step.label }}</strong>
                    <span class="status-pill" :class="step.status === 'active' ? 'status-active' : step.status === 'completed' ? 'status-completed' : 'status-not-started'">
                      {{ step.status === 'active' ? 'Active' : step.status === 'completed' ? 'Completed' : 'Not started' }}
                    </span>
                  </div>

                  <p class="step-card__description">
                    {{ step.status === 'active' ? 'Current active module. Waiting for external trigger.' : step.status === 'completed' ? 'Module completed by external API trigger.' : 'Blocked until the previous module is completed.' }}
                  </p>

                  <div class="step-card__meta">
                    <span>Key: {{ step.key }}</span>
                    <span>Updated: {{ step.updatedAt }}</span>
                  </div>
                </div>

                <div class="step-card__side">
                  <div v-if="step.status === 'active'" class="step-card__hint">Trigger the API to complete this module</div>
                  <div v-else-if="step.status === 'completed'" class="approved-mark">
                    <span class="approved-mark__icon">✓</span>
                    <div>
                      <strong>Completed</strong>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { Trash2 } from 'lucide-vue-next'

import ProjectFlowSnapshot from '../components/ProjectFlowSnapshot.vue'
import { useProjectProgressStore } from '../stores/projectProgress'

const progressStore = useProjectProgressStore()
const { projects } = storeToRefs(progressStore)
const selectedProjectId = ref(null)

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
  const currentNodeId = runtime?.currentNodeId ?? state?.currentNodeId ?? null
  return {
    completedNodeIds,
    currentNodeId,
    status: runtime?.status ?? 'not_started',
    updatedAt: runtime?.updatedAt ?? selectedProject.value?.updatedAt ?? '—',
  }
})

const projectSteps = computed(() => {
  const nodes = Array.isArray(selectedProject.value?.diagram?.nodes) ? selectedProject.value.diagram.nodes : []
  const completedNodeIds = new Set(runtimeState.value.completedNodeIds)
  const currentNodeId = runtimeState.value.currentNodeId

  return nodes.map((node) => {
    const nodeId = node.id
    const status = completedNodeIds.has(nodeId)
      ? 'completed'
      : currentNodeId === nodeId
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
  const nodes = Array.isArray(definition?.nodes) ? definition.nodes : []
  const triggerMap = selectedProject.value?.triggerMap ?? {}
  const workflowId = selectedProject.value?.id
  const completedNodeIds = new Set(runtimeState.value.completedNodeIds)
  const currentNodeId = runtimeState.value.currentNodeId

  return nodes
    .map((node) => {
      const code = node.code ?? node.id
      const fallbackUrl = `/workflow/${workflowId}/module/${code}/trigger`
      const triggerUrl = triggerMap?.[code] ?? fallbackUrl
      const nodeId = node.id
      const status = completedNodeIds.has(nodeId)
        ? 'completed'
        : currentNodeId === nodeId
          ? 'active'
          : 'not_started'

      return {
        code,
        label: node.title ?? node.label ?? node.id,
        status,
        requiredFieldsText: (node.workflow?.requiredFields ?? []).join(', ') || '—',
        triggerUrl,
      }
    })
    .filter((module) => Boolean(module.code))
})

const approvedStepCount = computed(() => projectSteps.value.filter((step) => step.status === 'completed').length)
const isWorkflowComplete = computed(() => projectSteps.value.length > 0 && approvedStepCount.value === projectSteps.value.length)
const workflowCompletedAt = computed(() => (isWorkflowComplete.value ? runtimeState.value.updatedAt : '—'))

const activeStep = computed(() => projectSteps.value.find((step) => step.status === 'active') ?? null)

function handleDeleteProject(project) {
  const ok = window.confirm(`Delete "${project.name}"? This cannot be undone.`)
  if (!ok) return

  const deleted = progressStore.deleteProject(project.id)
  if (deleted && selectedProjectId.value === project.id) {
    selectedProjectId.value = projects.value[0]?.id ?? null
  }
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

<style scoped>
.my-center-page {
  min-height: 100vh;
  padding: 32px clamp(16px, 3vw, 40px);
  background:
    radial-gradient(circle at top right, rgb(111 168 255 / 16%), transparent 38%),
    linear-gradient(180deg, #12151d 0%, #0f1218 100%);
  color: var(--color-text);
}

.hero-shell,
.project-list-shell,
.detail-shell,
.api-shell,
.snapshot-shell,
.step-list-shell {
  background: rgb(23 27 36 / 88%);
  border: 1px solid rgb(126 162 255 / 16%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 24%);
  backdrop-filter: blur(14px);
}

.hero-shell {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  padding: 28px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--neon-cyan);
}

.eyebrow--success {
  color: #86efac;
}

.hero-copy,
.project-card p {
  color: var(--color-text-muted);
  line-height: 1.6;
}

.hero-action {
  border: 1px solid rgb(126 162 255 / 24%);
  background: rgb(255 255 255 / 4%);
  color: var(--color-text);
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 12px;
}

.projects-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
}

.project-list-shell,
.detail-shell,
.api-shell,
.snapshot-shell,
.step-list-shell {
  padding: 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.section-head.compact {
  margin-bottom: 12px;
}

.completion-banner,
.api-card,
.detail-card,
.step-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.completion-banner:hover,
.api-card:hover,
.detail-card:hover,
.step-card:hover {
  transform: translateY(-2px);
}

.count-chip,
.detail-label {
  color: var(--color-text-muted);
  font-size: 13px;
}

.completion-banner {
  margin-bottom: 18px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgb(62 208 142 / 12%), rgb(88 229 255 / 8%));
  border: 1px solid rgb(88 229 255 / 16%);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.completion-banner__meta {
  display: flex;
  gap: 12px 18px;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 13px;
}

.project-list {
  display: grid;
  gap: 12px;
}

.api-list {
  display: grid;
  gap: 12px;
}

.api-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 2%));
  border: 1px solid rgb(255 255 255 / 7%);
}

.api-card__header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.api-card__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid rgb(255 255 255 / 6%);
}

.api-card__row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.api-card__row--stacked {
  flex-direction: column;
  align-items: flex-start;
}

.api-card__label {
  color: var(--color-text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.api-card__url,
.api-card__example code,
.api-card__code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  color: #dbeafe;
  word-break: break-all;
}

.api-card__example {
  display: grid;
  gap: 6px;
  margin-top: 4px;
  color: var(--color-text-muted);
}

.api-copy-btn {
  border: 1px solid rgb(88 229 255 / 18%);
  background: rgb(88 229 255 / 10%);
  color: #bff7ff;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.api-copy-btn:hover {
  background: rgb(88 229 255 / 16%);
}

.project-card {
  position: relative;
  text-align: left;
  border: 1px solid rgb(255 255 255 / 6%);
  background: rgb(255 255 255 / 3%);
  color: inherit;
  border-radius: 16px;
  padding: 16px 56px 16px 16px;
  cursor: pointer;
  text-decoration: none;
}

.project-card--link {
  display: block;
}

.project-card.active {
  border-color: rgb(88 229 255 / 24%);
  box-shadow: inset 0 0 0 1px rgb(88 229 255 / 14%);
}

.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: rgb(255 116 116 / 16%);
  color: #ff9d9d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgb(255 116 116 / 24%);
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.project-card__subheader {
  margin-top: 8px;
}

.project-card__meta {
  margin-top: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-active {
  background: rgb(88 229 255 / 14%);
  color: #8fefff;
  border: 1px solid rgb(88 229 255 / 18%);
}

.status-not-started {
  background: rgb(148 163 184 / 14%);
  color: #cbd5e1;
  border: 1px solid rgb(148 163 184 / 18%);
}

.status-completed {
  background: rgb(62 208 142 / 16%);
  color: #8ef0bc;
  border: 1px solid rgb(62 208 142 / 18%);
}

.empty-state {
  padding: 28px 16px;
  border: 1px dashed rgb(126 162 255 / 24%);
  border-radius: 16px;
  text-align: center;
  color: var(--color-text-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  padding: 14px;
  border-radius: 16px;
  background: rgb(255 255 255 / 3%);
  border: 1px solid rgb(255 255 255 / 6%);
  display: grid;
  gap: 6px;
}

.snapshot-shell,
.step-list-shell {
  margin-top: 18px;
}

.step-list {
  display: grid;
  gap: 12px;
}

.step-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 2%));
  border: 1px solid rgb(255 255 255 / 7%);
  box-shadow: 0 10px 30px rgb(0 0 0 / 12%);
}

.step-card--active {
  border-color: rgb(88 229 255 / 20%);
  box-shadow: inset 0 0 0 1px rgb(88 229 255 / 10%), 0 12px 30px rgb(0 0 0 / 14%);
}

.step-card--completed {
  border-color: rgb(62 208 142 / 18%);
}

.step-card--not_started {
  opacity: 0.82;
}

.step-card.is-active {
  background: linear-gradient(180deg, rgb(88 229 255 / 5%), rgb(255 255 255 / 2%));
}

.step-card__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
}

.step-card__main {
  display: grid;
  gap: 10px;
}

.step-card__topline {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: start;
}

.step-card__title {
  font-size: 16px;
  line-height: 1.3;
}

.step-card__description {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.65;
}

.step-card__meta {
  display: flex;
  gap: 10px 16px;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.step-card__side {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.approved-mark {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a7f3d0;
  background: rgb(62 208 142 / 8%);
  border: 1px solid rgb(62 208 142 / 14%);
  border-radius: 14px;
  padding: 12px 14px;
}

.approved-mark__icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgb(62 208 142 / 16%);
  color: #8ef0bc;
  font-weight: 900;
}

.step-item__topline,
.step-item__meta,
.step-api-box__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.step-item__meta {
  margin-top: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  flex-wrap: wrap;
}

.approve-btn {
  border: 1px solid rgb(88 229 255 / 20%);
  border-radius: 14px;
  min-height: 42px;
  padding: 0 16px;
  background: linear-gradient(135deg, rgb(88 229 255 / 22%), rgb(96 165 250 / 24%));
  color: #ecfeff;
  font-weight: 800;
  box-shadow: 0 10px 24px rgb(88 229 255 / 10%);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgb(88 229 255 / 14%);
}

.approve-btn:active {
  transform: translateY(0);
}

@media (max-width: 960px) {
  .hero-shell,
  .projects-grid,
  .detail-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .step-card__grid {
    grid-template-columns: 1fr;
  }

  .step-card__side {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .my-center-page {
    padding: 16px;
  }

  .project-list-shell,
  .detail-shell,
  .hero-shell {
    padding: 18px;
  }

  .hero-shell {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-card {
    padding-right: 16px;
  }

  .project-card__meta {
    width: 100%;
  }
}
</style>
