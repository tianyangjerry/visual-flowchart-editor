<template>
  <div class="editor-page">
    <header class="editor-header">
      <Toolbar :save-status="saveStatus" :saving="isSaving" @save-project="handleProjectSave" />
    </header>

    <div class="editor-body" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <aside class="editor-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
        <Sidebar @collapse-changed="isSidebarCollapsed = $event" />
      </aside>

      <main class="editor-canvas">
        <DiagramCanvas />
      </main>

      <aside class="editor-panel">
        <PropertyPanel />
      </aside>
    </div>

    <ConfirmDialog
      v-model:show="showRulesDialog"
      title="Flow Rules Overview"
      :message="rulesDialogMessage"
      confirm-text="I Understand"
      cancel-text="Close"
      @confirm="diagramStore.closeRulesDialog()"
      @cancel="diagramStore.closeRulesDialog()"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import ConfirmDialog from '../components/ConfirmDialog.vue'
import Toolbar from '../components/Toolbar.vue'
import Sidebar from '../components/Sidebar.vue'
import DiagramCanvas from '../components/DiagramCanvas.vue'
import PropertyPanel from '../components/PropertyPanel.vue'
import { getFlowchart, saveFlowchart } from '../services/api'
import { useDiagramStore } from '../stores/diagramStore'
import { useProjectProgressStore } from '../stores/projectProgress'

defineOptions({
  name: 'EditorPage',
})

const route = useRoute()
const diagramStore = useDiagramStore()
const progressStore = useProjectProgressStore()
const isSidebarCollapsed = ref(false)
const isSaving = ref(false)
const saveStatus = ref('Ready to sync to backend')
const currentFlowchartId = ref(null)

const showRulesDialog = computed({
  get: () => diagramStore.ui.showRulesDialog,
  set: (nextValue) => {
    if (nextValue) {
      diagramStore.openRulesDialog()
    } else {
      diagramStore.closeRulesDialog()
    }
  },
})

const rulesDialogMessage = [
  'Node Semantics:',
  '- Process: executable logic step.',
  '- Decision: branching node, first two outgoing edges are auto-labeled Yes / No.',
  '- Terminal start: output only. Terminal end: input only.',
  '- Data: can only connect to Process (data → process).',
  '',
  'Connect Mode Guidance:',
  '- Hover target node to preview whether connection is allowed.',
  '- Green border = allowed, red border = blocked (reason shown on canvas).',
].join('\n')

async function persistToBackend(diagram) {
  isSaving.value = true
  saveStatus.value = 'Saving to backend...'

  try {
    const saved = await saveFlowchart({
      id: currentFlowchartId.value ?? diagram?.id,
      name: diagram?.meta?.name ?? diagram?.name ?? 'Untitled Flow',
      description: diagram?.meta?.description ?? 'Saved from the flowchart editor.',
      status: 'doing',
      diagram,
      meta: diagram?.meta ?? {},
    })

    const normalizedDiagram = {
      ...diagram,
      id: saved.id,
      meta: {
        ...(diagram?.meta ?? {}),
        name: saved.name,
        description: saved.description,
      },
    }

    currentFlowchartId.value = saved.id
    diagramStore.loadDiagram(normalizedDiagram)
    await progressStore.upsertProjectFromDiagram(normalizedDiagram, {
      projectId: saved.id,
      name: saved.name,
      description: saved.description,
      status: saved.status,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    })

    saveStatus.value = 'Saved to backend'
    return saved
  } catch (error) {
    saveStatus.value = 'Save failed'
    console.error('Failed to persist diagram to backend:', error)
    throw error
  } finally {
    isSaving.value = false
  }
}

async function loadFlowchartIntoEditor(flowchartId) {
  if (!flowchartId) return false

  saveStatus.value = 'Loading flowchart...'
  const flowchart = await getFlowchart(flowchartId)
  if (!flowchart) {
    saveStatus.value = 'Flowchart not found'
    return false
  }

  currentFlowchartId.value = flowchart.id
  diagramStore.loadDiagram({
    id: flowchart.id,
    schemaVersion: flowchart.schemaVersion ?? 2,
    ...flowchart.diagram,
    meta: {
      ...(flowchart.meta ?? {}),
      name: flowchart.name,
      description: flowchart.description,
    },
  })
  saveStatus.value = 'Loaded saved flowchart'
  return true
}

function shouldIgnoreShortcut(event) {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return false
  }
  const tagName = target.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable
}

function handleKeydown(event) {
  if (shouldIgnoreShortcut(event)) {
    return
  }

  if (event.key === 'Delete') {
    event.preventDefault()
    diagramStore.deleteSelection()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    diagramStore.pendingSourceNodeId = null
    diagramStore.clearSelection()
  }
}

async function handleProjectSave(payload) {
  const validation = diagramStore.validateWorkflowDefinition()
  if (!validation.valid) {
    saveStatus.value = validation.issues[0] || 'Workflow is incomplete'
    return
  }

  const diagram = payload ?? diagramStore.exportDiagram()
  await persistToBackend(diagram)
}

watch(
  () => route.query.flowchartId,
  async (flowchartId) => {
    if (typeof flowchartId === 'string' && flowchartId.trim()) {
      await loadFlowchartIntoEditor(flowchartId.trim())
    }
  },
  { immediate: true },
)

onMounted(() => {
  diagramStore.openRulesDialog()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  overflow: hidden;
}

.editor-header {
  border-bottom: 1px solid var(--color-border);
  flex: 0 0 auto;
}

.editor-body {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 320px;
  overflow: hidden;
  transition: grid-template-columns 0.22s ease;
}

.editor-body.sidebar-collapsed {
  grid-template-columns: 72px minmax(0, 1fr) 320px;
}

.editor-sidebar {
  border-right: 1px solid var(--color-border);
  background: var(--color-panel);
  min-width: 0;
  overflow: hidden;
  transition: width 0.22s ease;
}

.editor-canvas {
  min-width: 0;
  min-height: 0;
  background: var(--color-bg);
  overflow: hidden;
}

.editor-panel {
  border-left: 1px solid var(--color-border);
  background: var(--color-panel);
  min-width: 320px;
  overflow: auto;
}
</style>
