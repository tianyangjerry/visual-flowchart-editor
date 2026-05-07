<template>
  <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar__header">
      <h2 v-if="!isCollapsed" class="sidebar__title">Tools</h2>
      <button
        class="sidebar__collapse-btn"
        type="button"
        :title="isCollapsed ? 'Expand tools' : 'Collapse tools'"
        @click="isCollapsed = !isCollapsed"
      >
        <ChevronRight v-if="isCollapsed" :size="20" />
        <ChevronLeft v-else :size="20" />
      </button>
    </div>

    <div v-if="!isCollapsed" class="sidebar__content">
      <section class="sidebar__section">
        <h3 class="sidebar__subtitle">Mode</h3>
        <div class="sidebar__row">
          <button
            class="sidebar__btn"
            :class="{ 'is-active': diagramStore.mode === 'select' }"
            type="button"
            @click="diagramStore.setMode('select')"
          >
            <Pointer :size="15" />
            <span>Select</span>
          </button>
          <button
            class="sidebar__btn"
            :class="{ 'is-active': diagramStore.mode === 'connect' }"
            type="button"
            @click="diagramStore.setMode('connect')"
          >
            <Link2 :size="15" />
            <span>Connect</span>
          </button>
        </div>
      </section>

      <section class="sidebar__section">
        <h3 class="sidebar__subtitle">Create Node</h3>
        <button class="sidebar__btn sidebar__btn--full" type="button" @click="addNode('task')">
          <PlaySquare :size="15" />
          <span>Task Node</span>
        </button>
        <button class="sidebar__btn sidebar__btn--full" type="button" @click="addNode('decision')">
          <GitBranch :size="15" />
          <span>Decision Node</span>
        </button>
        <button class="sidebar__btn sidebar__btn--full" type="button" @click="addNode('start')">
          <CirclePlay :size="15" />
          <span>Start Node</span>
        </button>
        <button class="sidebar__btn sidebar__btn--full" type="button" @click="addNode('end')">
          <CirclePlay :size="15" />
          <span>End Node</span>
        </button>
        <button class="sidebar__btn sidebar__btn--full" type="button" @click="addNode('data')">
          <Database :size="15" />
          <span>Data Node</span>
        </button>
      </section>
    </div>

    <div v-else class="sidebar__collapsed-actions">
      <button class="sidebar__icon-btn" type="button" title="Select mode" @click="diagramStore.setMode('select')">
        <Pointer :size="20" />
      </button>
      <button class="sidebar__icon-btn" type="button" title="Connect mode" @click="diagramStore.setMode('connect')">
        <Link2 :size="20" />
      </button>
      <span class="sidebar__divider" />
      <button class="sidebar__icon-btn" type="button" title="Add task node" @click="addNode('task')">
        <PlaySquare :size="20" />
      </button>
      <button class="sidebar__icon-btn" type="button" title="Add decision node" @click="addNode('decision')">
        <GitBranch :size="20" />
      </button>
      <button class="sidebar__icon-btn" type="button" title="Add start node" @click="addNode('start')">
        <CirclePlay :size="20" />
      </button>
      <button class="sidebar__icon-btn" type="button" title="Add end node" @click="addNode('end')">
        <CirclePlay :size="20" />
      </button>
      <button class="sidebar__icon-btn" type="button" title="Add data node" @click="addNode('data')">
        <Database :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Database,
  GitBranch,
  Link2,
  Pointer,
  PlaySquare,
} from 'lucide-vue-next'

import { useDiagramStore } from '../../stores/diagramStore.js'

defineOptions({
  name: 'SidebarPanel',
})

const emit = defineEmits(['collapse-changed'])

const diagramStore = useDiagramStore()
const isCollapsed = ref(false)

watch(isCollapsed, (value) => {
  emit('collapse-changed', value)
})

function addNode(type) {
  const titleMap = {
    task: 'Submit Material',
    decision: 'Approval Check',
    start: 'Start',
    end: 'End',
    data: 'Payload Data',
  }

  const workflowMap = {
    task: {
      triggerMode: 'manual',
      requiredFields: ['material_name', 'quantity', 'owner'],
      nextAction: 'Route to review',
    },
    decision: {
      triggerMode: 'manual',
      requiredFields: ['status', 'risk_level'],
      conditionExpression: 'status === "approved"',
      trueTarget: 'Approved branch',
      falseTarget: 'Revision branch',
    },
    start: {
      triggerMode: 'auto',
      requiredFields: [],
      nextAction: 'Start the flow',
    },
    end: {
      triggerMode: 'auto',
      requiredFields: [],
      nextAction: 'Close the flow',
    },
    data: {
      triggerMode: 'api',
      requiredFields: ['source_id'],
      triggerUrl: '/api/workflow/data',
    },
  }

  diagramStore.addNode({
    type,
    title: titleMap[type] ?? 'Workflow Node',
    subtitle: 'Workflow step',
    workflow: workflowMap[type],
    terminalKind: type === 'end' ? 'end' : type === 'start' ? 'start' : undefined,
    layout: {
      x: 140 + diagramStore.nodes.length * 22,
      y: 140 + diagramStore.nodes.length * 16,
      width: 260,
      height: 140,
    },
  })
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  width: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--color-text);
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar__title {
  margin: 0;
  font-size: 16px;
}

.sidebar__collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-muted);
  color: var(--color-text);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.sidebar__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar__subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.sidebar__row {
  display: flex;
  gap: 8px;
}

.sidebar__btn {
  border: 1px solid var(--color-border);
  background: var(--color-panel-muted);
  color: var(--color-text);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sidebar__btn:hover {
  background: #243247;
}

.sidebar__btn.is-active {
  border-color: var(--neon-blue);
  box-shadow: 0 0 0 1px rgb(96 165 250 / 40%);
}

.sidebar__btn--full {
  width: 100%;
  text-align: left;
}

.sidebar__collapsed-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.sidebar__icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  border: 1px solid var(--color-border);
  background: var(--color-panel-muted);
  color: var(--color-text);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.sidebar__icon-btn:hover {
  background: #243247;
}

.sidebar__divider {
  width: 34px;
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
}

.is-collapsed {
  padding: 8px 6px;
  align-items: center;
}

.is-collapsed .sidebar__header {
  width: 100%;
  justify-content: center;
}

.is-collapsed .sidebar__collapsed-actions {
  width: 100%;
}
</style>
