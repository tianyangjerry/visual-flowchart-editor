<template>
  <div class="property-panel">
    <h2 class="property-panel__title">Properties</h2>

    <section class="property-panel__about" aria-label="Workflow guide">
      <button
        class="property-panel__about-toggle"
        type="button"
        :aria-expanded="isAboutGuideOpen"
        aria-controls="property-panel-about-body"
        @click="isAboutGuideOpen = !isAboutGuideOpen"
      >
        <div class="property-panel__about-head">
          <div>
            <span class="property-panel__about-title">About</span>
            <span class="property-panel__about-subtitle">Quick workflow rules at a glance.</span>
          </div>
          <span class="property-panel__about-pill">Guide</span>
        </div>
      </button>

      <div v-show="isAboutGuideOpen" id="property-panel-about-body" class="property-panel__about-body">
        <div class="property-panel__guide-line">
          <div class="property-panel__guide-step">
            <div class="property-panel__guide-icon is-auto">S</div>
            <div class="property-panel__guide-label">Start</div>
            <div class="property-panel__guide-tag is-auto">auto</div>
          </div>
          <div class="property-panel__guide-arrow">→</div>
          <div class="property-panel__guide-step">
            <div class="property-panel__guide-icon is-manual-api">T</div>
            <div class="property-panel__guide-label">Task / Data</div>
            <div class="property-panel__guide-tag is-manual-api">manual / api</div>
          </div>
          <div class="property-panel__guide-arrow">→</div>
          <div class="property-panel__guide-step">
            <div class="property-panel__guide-icon is-decision">D</div>
            <div class="property-panel__guide-label">Decision</div>
            <div class="property-panel__guide-tag is-decision">true / false</div>
          </div>
          <div class="property-panel__guide-arrow">→</div>
          <div class="property-panel__guide-step">
            <div class="property-panel__guide-icon is-auto">E</div>
            <div class="property-panel__guide-label">End</div>
            <div class="property-panel__guide-tag is-auto">auto</div>
          </div>
        </div>

        <ul class="property-panel__guide-notes">
          <li>Start can only connect forward, End only receives flow.</li>
          <li>Normal nodes use manual / api, and can move forward to the next step.</li>
          <li>Decision nodes split to two outputs, labeled true and false.</li>
        </ul>
      </div>
    </section>

    <section class="property-panel__help" aria-label="Editor help accordion">
      <div id="propertyGuideAccordion" class="accordion property-panel__accordion">
        <div v-for="item in guideItems" :key="item.id" class="accordion-item property-panel__accordion-item">
          <h3 class="accordion-header property-panel__accordion-title">
            <button
              class="accordion-button property-panel__accordion-button"
              :class="{ collapsed: openGuideItem !== item.id }"
              type="button"
              :aria-expanded="openGuideItem === item.id"
              :aria-controls="`${item.id}-panel`"
              @click="toggleGuideItem(item.id)"
            >
              {{ item.title }}
            </button>
          </h3>

          <div
            :id="`${item.id}-panel`"
            class="accordion-collapse collapse property-panel__accordion-collapse"
            :class="{ show: openGuideItem === item.id }"
          >
            <div class="accordion-body property-panel__accordion-body">
              {{ item.copy }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="selectedNode" class="property-panel__content">
      <details class="property-panel__section">
        <summary>Basic</summary>
        <label class="property-panel__field">
          <span>Title</span>
          <input :value="selectedNode.title" type="text" @input="updateNodeField('title', $event.target.value)" />
        </label>
        <label class="property-panel__field">
          <span>Status</span>
          <select :value="selectedNode.workflow?.status ?? selectedNode.status ?? 'active'" @change="updateWorkflowField('status', $event.target.value)">
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
          </select>
        </label>
      </details>

      <details class="property-panel__section">
        <summary>Workflow</summary>
        <div v-if="isStartNode || isEndNode" class="property-panel__locked-note is-auto">
          {{ isStartNode ? 'Start node begins the workflow and can connect forward.' : 'End node closes the workflow and only accepts incoming connections.' }}
        </div>
        <div v-if="isStartNode || isEndNode" class="property-panel__mode-badge is-auto">auto</div>
        <label v-else class="property-panel__field">
          <span>Trigger Mode</span>
          <select :value="normalizedTriggerMode" @change="updateWorkflowMode($event.target.value)">
            <option value="api">api</option>
          </select>
        </label>
        <label class="property-panel__field">
          <span>Required Fields (one per line)</span>
          <textarea :value="requiredFieldsText" rows="4" @input="updateRequiredFields($event.target.value)"></textarea>
        </label>
        <label class="property-panel__field">
          <span>Next Action</span>
          <input :value="selectedNode.workflow?.nextAction ?? ''" type="text" @input="updateWorkflowField('nextAction', $event.target.value)" />
        </label>
        <label v-if="isDecisionNode" class="property-panel__field">
          <span>Condition Expression</span>
          <input :value="selectedNode.workflow?.conditionExpression ?? ''" type="text" @input="updateWorkflowField('conditionExpression', $event.target.value)" />
        </label>
        <label v-if="isDecisionNode" class="property-panel__field">
          <span>True Target</span>
          <input :value="selectedNode.workflow?.trueTarget ?? ''" type="text" @input="updateWorkflowField('trueTarget', $event.target.value)" />
        </label>
        <label v-if="isDecisionNode" class="property-panel__field">
          <span>False Target</span>
          <input :value="selectedNode.workflow?.falseTarget ?? ''" type="text" @input="updateWorkflowField('falseTarget', $event.target.value)" />
        </label>
      </details>

      <details v-if="normalizedTriggerMode === 'api'" class="property-panel__section">
        <summary>API Config</summary>
        <div class="property-panel__locked-note is-auto">
          Trigger URL is generated by the backend after saving the workflow definition.
        </div>
      </details>

      <details class="property-panel__section">
        <summary>Connections</summary>
        <label class="property-panel__field">
          <span>Width</span>
          <div class="property-panel__stepper">
            <button class="property-panel__stepper-btn" type="button" @click="stepEdgeWidth(-1)">−</button>
            <input :value="selectedEdge?.style?.width ?? 2.4" class="property-panel__number-input" type="number" min="1" max="16" step="0.2" @input="updateEdgeStyleField('width', Number($event.target.value))" />
            <button class="property-panel__stepper-btn" type="button" @click="stepEdgeWidth(1)">+</button>
          </div>
        </label>
        <div class="property-panel__connections">
          <h4 class="property-panel__connections-title">Next Node</h4>
          <ul v-if="outgoingConnections.length" class="property-panel__connections-list">
            <li v-for="connection in outgoingConnections" :key="connection.edgeId" class="property-panel__connection-item">
              <span>{{ connection.targetTitle }}</span>
              <button class="property-panel__danger-btn" type="button" @click="removeConnection(connection)">Remove</button>
            </li>
          </ul>
        </div>
      </details>

      <div class="property-panel__module-actions">
        <button class="property-panel__danger-btn property-panel__danger-btn--block" type="button" @click="removeModule">
          Delete module
        </button>
      </div>
    </div>

    <div v-else-if="selectedEdge" class="property-panel__content">
      <details class="property-panel__section">
        <summary>Connections</summary>
        <label class="property-panel__field">
          <span>Label</span>
          <input :value="selectedEdge.label ?? 'next'" type="text" @input="updateEdgeField('label', $event.target.value)" />
        </label>
        <label class="property-panel__field">
          <span>Direction</span>
          <select :value="selectedEdge.style.direction ?? 'forward'" @change="updateEdgeStyleField('direction', $event.target.value)">
            <option value="forward">forward</option>
            <option value="both">both</option>
            <option value="none">none</option>
          </select>
        </label>
      </details>
    </div>

    <p v-else class="property-panel__empty">Select a node or edge to edit properties.</p>

    <ConfirmDialog
      v-model:show="isRemoveConfirmVisible"
      :title="confirmDialogTitle"
      :message="confirmMessage"
      :confirm-text="confirmButtonText"
      cancel-text="Keep"
      @confirm="handleConfirmAction"
      @cancel="cancelConfirmAction"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import ConfirmDialog from './edge/ConfirmDialog.vue'
import { useDiagramStore } from '../../stores/diagramStore.js'

defineOptions({
  name: 'PropertyPanel',
})

const diagramStore = useDiagramStore()
const { selectedNode, selectedEdge } = storeToRefs(diagramStore)

const isRemoveConfirmVisible = ref(false)
const pendingRemoveConnection = ref(null)
const pendingRemoveModule = ref(null)
const isAboutGuideOpen = ref(false)
const guideItems = [
  {
    id: 'guide-basic',
    title: 'Basic settings',
    copy: 'Use the title and status fields to keep each module readable before connecting it to the workflow.',
  },
  {
    id: 'guide-workflow',
    title: 'Workflow trigger',
    copy: 'Task and data nodes use API mode. Start and End nodes are locked to automatic behavior.',
  },
  {
    id: 'guide-routing',
    title: 'Routing rules',
    copy: 'Decision nodes should define a condition and route outcomes through true and false connections.',
  },
]
const openGuideItem = ref(guideItems[0].id)

const requiredFieldsText = computed(() => {
  if (!selectedNode.value) return ''
  return (selectedNode.value.workflow?.requiredFields ?? []).join('\n')
})

const normalizedTriggerMode = computed(() => {
  if (selectedNode.value?.type === 'start' || selectedNode.value?.type === 'end') return 'auto'
  const mode = selectedNode.value?.workflow?.triggerMode
  return ['manual', 'api'].includes(mode) ? mode : 'manual'
})

const isDecisionNode = computed(() => selectedNode.value?.type === 'decision')
const isStartNode = computed(() => selectedNode.value?.type === 'start')
const isEndNode = computed(() => selectedNode.value?.type === 'end')

const outgoingConnections = computed(() => {
  if (!selectedNode.value) return []
  const currentNodeId = selectedNode.value.id
  return diagramStore.edges
    .filter((edge) => edge.source === currentNodeId)
    .map((edge) => {
      const targetNode = diagramStore.nodes.find((node) => node.id === edge.target)
      return {
        edgeId: edge.id,
        targetTitle: targetNode?.title ?? edge.target,
      }
    })
})

const confirmActionType = computed(() => {
  if (pendingRemoveModule.value) return 'module'
  if (pendingRemoveConnection.value) return 'connection'
  return 'none'
})

const connectedEdgeCount = computed(() => {
  if (!selectedNode.value) return 0
  return diagramStore.edges.filter(
    (edge) => edge.source === selectedNode.value.id || edge.target === selectedNode.value.id,
  ).length
})

const confirmDialogTitle = computed(() => (confirmActionType.value === 'module' ? 'Delete module' : 'Remove connection'))
const confirmButtonText = computed(() => (confirmActionType.value === 'module' ? 'Delete' : 'Remove'))

const confirmMessage = computed(() => {
  if (confirmActionType.value === 'module') {
    if (!pendingRemoveModule.value) return 'Are you sure you want to delete this module?'
    const nodeTitle = pendingRemoveModule.value.title || 'Untitled module'
    const edgeCount = connectedEdgeCount.value
    return `Delete module "${nodeTitle}"? This will also remove ${edgeCount} connected line${edgeCount === 1 ? '' : 's'}.`
  }

  if (confirmActionType.value === 'connection' && pendingRemoveConnection.value) {
    return `Are you sure you want to remove the line to "${pendingRemoveConnection.value.targetTitle}"?`
  }

  return 'Are you sure you want to continue?'
})

function updateNodeField(field, value) {
  if (!selectedNode.value) return
  diagramStore.updateNode(selectedNode.value.id, { [field]: value })
}

function toggleGuideItem(id) {
  openGuideItem.value = openGuideItem.value === id ? null : id
}

function updateWorkflowField(field, value) {
  if (!selectedNode.value) return
  if (field === 'triggerUrl') return
  diagramStore.updateNode(selectedNode.value.id, {
    workflow: {
      ...(selectedNode.value.workflow ?? {}),
      [field]: value,
    },
  })
}

function updateWorkflowMode(nextMode) {
  if (!selectedNode.value) return
  if (selectedNode.value.type === 'start' || selectedNode.value.type === 'end') {
    updateWorkflowField('triggerMode', 'auto')
    return
  }
  updateWorkflowField('triggerMode', nextMode === 'api' ? 'api' : 'api')
}

function updateRequiredFields(text) {
  if (!selectedNode.value) return
  updateWorkflowField(
    'requiredFields',
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  )
}

function updateEdgeField(field, value) {
  if (!selectedEdge.value) return
  diagramStore.updateEdge(selectedEdge.value.id, { [field]: value })
}

function updateEdgeStyleField(field, value) {
  if (!selectedEdge.value) return
  diagramStore.updateEdge(selectedEdge.value.id, {
    style: {
      ...selectedEdge.value.style,
      [field]: value,
    },
  })
}

function stepEdgeWidth(delta) {
  if (!selectedEdge.value) return
  const currentWidth = Number(selectedEdge.value.style.width) || 1
  const nextWidth = Math.min(16, Math.max(1, currentWidth + delta))
  updateEdgeStyleField('width', nextWidth)
}

function removeConnection(connection) {
  pendingRemoveModule.value = null
  pendingRemoveConnection.value = connection
  isRemoveConfirmVisible.value = true
}

function removeModule() {
  if (!selectedNode.value) return
  pendingRemoveConnection.value = null
  pendingRemoveModule.value = {
    id: selectedNode.value.id,
    title: selectedNode.value.title,
  }
  isRemoveConfirmVisible.value = true
}

function handleConfirmAction() {
  if (confirmActionType.value === 'module' && pendingRemoveModule.value) {
    diagramStore.removeNode(pendingRemoveModule.value.id)
    pendingRemoveModule.value = null
    isRemoveConfirmVisible.value = false
    return
  }

  if (confirmActionType.value === 'connection' && pendingRemoveConnection.value) {
    diagramStore.removeEdge(pendingRemoveConnection.value.edgeId)
    pendingRemoveConnection.value = null
    isRemoveConfirmVisible.value = false
    return
  }

  cancelConfirmAction()
}

function cancelConfirmAction() {
  pendingRemoveConnection.value = null
  pendingRemoveModule.value = null
  isRemoveConfirmVisible.value = false
}
</script>

<style scoped>
.property-panel {
  padding: 16px;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-panel__title {
  margin: 0;
  font-size: 16px;
}

.property-panel__about {
  border: 1px solid #31405c;
  border-radius: 14px;
  background: linear-gradient(180deg, rgb(19 27 45 / 95%), rgb(14 20 34 / 95%));
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.property-panel__about-toggle {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 14px;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.property-panel__about-toggle:hover {
  background: rgb(148 163 184 / 8%);
}

.property-panel__about-toggle:focus-visible {
  outline: 3px solid rgb(95 111 82 / 18%);
  outline-offset: -3px;
}

.property-panel__about-body {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-panel__about-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.property-panel__about-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
}

.property-panel__about-subtitle {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #9fb0cb;
}

.property-panel__about-pill,
.property-panel__guide-tag,
.property-panel__mode-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
}

.property-panel__about-pill {
  color: #cde2d2;
  background: var(--color-action-soft);
  border: 1px solid rgb(77 107 87 / 30%);
}

.property-panel__guide-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 6px;
  align-items: center;
}

.property-panel__guide-step {
  border: 1px solid #2f3d58;
  border-radius: 12px;
  background: rgb(15 23 42 / 72%);
  padding: 10px 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.property-panel__guide-icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: white;
}

.property-panel__guide-icon.is-auto {
  background: linear-gradient(135deg, var(--color-action), var(--color-action-hover));
}

.property-panel__guide-icon.is-manual-api {
  background: linear-gradient(135deg, #c9c2b6, #eee9df);
}

.property-panel__guide-icon.is-decision {
  background: linear-gradient(135deg, #b8b8b8, #eeeeee);
}

.property-panel__guide-label {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.property-panel__guide-tag {
  color: #e2e8f0;
  background: rgb(148 163 184 / 14%);
  border: 1px solid rgb(148 163 184 / 20%);
  white-space: nowrap;
}

.property-panel__guide-tag.is-auto {
  background: var(--color-action-soft);
  border-color: rgb(77 107 87 / 28%);
}

.property-panel__guide-tag.is-manual-api {
  background: rgb(238 238 238 / 10%);
  border-color: rgb(238 238 238 / 18%);
}

.property-panel__guide-tag.is-decision {
  background: rgb(238 238 238 / 10%);
  border-color: rgb(238 238 238 / 18%);
}

.property-panel__guide-arrow {
  color: #7c8ba5;
  font-size: 18px;
  font-weight: 700;
  padding: 0 2px;
}

.property-panel__guide-notes {
  margin: 0;
  padding-left: 18px;
  color: #c8d3e6;
  font-size: 12px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-panel__help {
  border: 1px solid #31405c;
  border-radius: 14px;
  background: rgb(15 23 42 / 58%);
  overflow: hidden;
}

.property-panel__accordion-item {
  border-bottom: 1px solid #2a3955;
  background: transparent;
}

.property-panel__accordion-item:last-child {
  border-bottom: 0;
}

.property-panel__accordion-title {
  margin: 0;
}

.property-panel__accordion-button {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.property-panel__accordion-button::after {
  content: '';
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  color: #cde2d2;
  transform: rotate(45deg);
  transition: transform 180ms ease;
}

.property-panel__accordion-button:not(.collapsed)::after {
  transform: rotate(225deg);
}

.property-panel__accordion-button:hover,
.property-panel__accordion-button:not(.collapsed) {
  background: rgb(148 163 184 / 10%);
}

.property-panel__accordion-button:focus-visible {
  outline: 3px solid rgb(95 111 82 / 18%);
  outline-offset: -3px;
}

.property-panel__accordion-collapse {
  display: none;
}

.property-panel__accordion-collapse.show {
  display: block;
}

.property-panel__accordion-body {
  padding: 0 14px 14px;
  color: #c8d3e6;
  font-size: 12px;
  line-height: 1.55;
}

.property-panel__content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.property-panel__section {
  border: 1px solid #2a3955;
  border-radius: 12px;
  padding: 10px 12px;
  background: rgb(15 23 42 / 58%);
}

.property-panel__section summary {
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 10px;
}

.property-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 10px;
}

.property-panel__field input,
.property-panel__field select,
.property-panel__field textarea {
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 7px 9px;
}

.property-panel__field textarea {
  resize: vertical;
}

.property-panel__locked-note {
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  margin-bottom: 10px;
}

.property-panel__locked-note.is-auto {
  background: var(--color-action-soft);
  border: 1px solid rgb(77 107 87 / 28%);
  color: #cde2d2;
}

.property-panel__mode-badge {
  width: fit-content;
  margin-bottom: 10px;
}

.property-panel__mode-badge.is-auto {
  background: var(--color-action-soft);
  border: 1px solid rgb(77 107 87 / 30%);
  color: #cde2d2;
}

.property-panel__stepper {
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
}

.property-panel__stepper-btn {
  border: 0;
  background: #172136;
  color: #e2e8f0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.property-panel__stepper-btn:hover {
  background: #22314e;
}

.property-panel__number-input {
  appearance: textfield;
  -moz-appearance: textfield;
  border: 0 !important;
  border-radius: 0 !important;
  text-align: center;
}

.property-panel__number-input::-webkit-outer-spin-button,
.property-panel__number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.property-panel__connections {
  border-top: 1px solid #334155;
  margin-top: 6px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-panel__connections-title {
  margin: 0;
  font-size: 12px;
  color: #a9b8cf;
}

.property-panel__connections-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-panel__connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #111b2f;
  padding: 7px 9px;
}

.property-panel__connection-name {
  font-size: 12px;
  color: #d7e2f5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.property-panel__danger-btn {
  border: 1px solid #7f1d1d;
  background: #3d1017;
  color: #fecdd3;
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
}

.property-panel__danger-btn:hover {
  background: #54131e;
}

.property-panel__module-actions {
  border-top: 1px dashed #3f2a32;
  margin-top: 4px;
  padding-top: 12px;
}

.property-panel__danger-btn--block {
  width: 100%;
  text-align: center;
  padding: 8px 10px;
  font-size: 12px;
}

.property-panel__empty {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
}

.property-panel {
  color: var(--color-text);
}

.property-panel__about,
.property-panel__help,
.property-panel__section {
  border-color: rgb(241 240 232 / 12%);
  border-radius: 8px;
  background: linear-gradient(180deg, rgb(32 27 24 / 92%), rgb(17 16 15 / 96%));
}

.property-panel__about-subtitle,
.property-panel__connections-title,
.property-panel__empty {
  color: var(--color-text-muted);
}

.property-panel__about-toggle:hover {
  background: rgb(241 240 232 / 6%);
}

.property-panel__about-pill {
  color: var(--color-accent);
  background: rgb(239 236 224 / 8%);
  border-color: rgb(239 236 224 / 16%);
}

.property-panel__guide-step {
  border-color: rgb(241 240 232 / 12%);
  border-radius: 8px;
  background: rgb(17 16 15 / 70%);
}

.property-panel__guide-icon.is-auto,
.property-panel__guide-icon.is-manual-api,
.property-panel__guide-icon.is-decision {
  color: #151410;
}

.property-panel__guide-icon.is-auto {
  background: linear-gradient(135deg, #d8d8d8, #ffffff);
}

.property-panel__guide-icon.is-manual-api {
  background: linear-gradient(135deg, #cfcfcf, #eeeeee);
}

.property-panel__guide-icon.is-decision {
  background: linear-gradient(135deg, #b8b8b8, #eeeeee);
}

.property-panel__guide-tag {
  color: var(--color-text);
  background: rgb(168 163 154 / 12%);
  border-color: rgb(168 163 154 / 18%);
}

.property-panel__guide-tag.is-auto,
.property-panel__locked-note.is-auto,
.property-panel__mode-badge.is-auto {
  color: #cde2d2;
  background: var(--color-action-soft);
  border-color: rgb(77 107 87 / 28%);
}

.property-panel__guide-tag.is-manual-api {
  background: rgb(239 236 224 / 9%);
  border-color: rgb(239 236 224 / 16%);
}

.property-panel__guide-tag.is-decision {
  background: rgb(238 238 238 / 10%);
  border-color: rgb(238 238 238 / 18%);
}

.property-panel__guide-arrow {
  color: var(--color-accent-muted);
}

.property-panel__guide-notes {
  color: var(--color-text-muted);
}

.property-panel__accordion-item {
  border-bottom-color: rgb(241 240 232 / 12%);
}

.property-panel__accordion-button {
  color: var(--color-text);
}

.property-panel__accordion-button::after {
  color: var(--color-action);
}

.property-panel__accordion-button:hover,
.property-panel__accordion-button:not(.collapsed) {
  background: rgb(241 240 232 / 6%);
}

.property-panel__accordion-body {
  color: var(--color-text-muted);
}

.property-panel__field input,
.property-panel__field select,
.property-panel__field textarea,
.property-panel__stepper {
  border-color: rgb(241 240 232 / 14%);
  background: rgb(17 16 15 / 86%);
  color: var(--color-text);
}

.property-panel__stepper-btn {
  background: rgb(241 240 232 / 6%);
  color: var(--color-text);
}

.property-panel__stepper-btn:hover {
  background: rgb(241 240 232 / 10%);
}

.property-panel__connections {
  border-top-color: rgb(241 240 232 / 10%);
}

.property-panel__connection-item {
  border-color: rgb(241 240 232 / 12%);
  background: rgb(241 240 232 / 4%);
}

.property-panel__connection-name {
  color: var(--color-text);
}

/* Final cream/olive property panel treatment */
.property-panel {
  color: var(--color-text);
}

.property-panel__about,
.property-panel__help,
.property-panel__section {
  border-color: var(--color-border);
  border-radius: 10px;
  background: var(--color-panel);
}

.property-panel__about-subtitle,
.property-panel__connections-title,
.property-panel__empty,
.property-panel__guide-notes {
  color: var(--color-text-muted);
}

.property-panel__about-toggle:hover {
  background: var(--color-bg-elevated);
}

.property-panel__about-pill {
  color: var(--color-action);
  background: var(--color-action-soft);
  border-color: rgb(95 111 82 / 24%);
}

.property-panel__guide-step {
  border-color: var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-elevated);
}

.property-panel__guide-icon {
  color: var(--color-panel);
}

.property-panel__guide-icon.is-auto {
  background: var(--color-action);
}

.property-panel__guide-icon.is-manual-api {
  background: #9a9184;
}

.property-panel__guide-icon.is-decision {
  background: var(--color-soft-accent);
  color: var(--color-text);
}

.property-panel__guide-tag,
.property-panel__guide-tag.is-manual-api,
.property-panel__guide-tag.is-decision {
  color: var(--color-text-muted);
  background: var(--color-panel);
  border-color: var(--color-border);
}

.property-panel__guide-tag.is-auto,
.property-panel__locked-note.is-auto,
.property-panel__mode-badge.is-auto {
  color: var(--color-action);
  background: var(--color-action-soft);
  border-color: rgb(95 111 82 / 24%);
}

.property-panel__guide-arrow {
  color: var(--color-soft-accent);
}

.property-panel__accordion-item {
  border-bottom-color: var(--color-border);
}

.property-panel__accordion-button {
  color: var(--color-text);
}

.property-panel__accordion-button::after {
  color: var(--color-action);
}

.property-panel__accordion-button:hover,
.property-panel__accordion-button:not(.collapsed) {
  background: var(--color-bg-elevated);
}

.property-panel__accordion-body {
  color: var(--color-text-muted);
}

.property-panel__field input,
.property-panel__field select,
.property-panel__field textarea,
.property-panel__stepper {
  border-color: var(--color-border);
  background: #fffefb;
  color: var(--color-text);
}

.property-panel__field input:focus,
.property-panel__field select:focus,
.property-panel__field textarea:focus {
  outline: none;
  border-color: var(--color-action);
  box-shadow: 0 0 0 3px rgb(95 111 82 / 12%);
}

.property-panel__stepper-btn {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.property-panel__stepper-btn:hover {
  background: #ede7dd;
}

.property-panel__connections {
  border-top-color: var(--color-border);
}

.property-panel__connection-item {
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
}

.property-panel__danger-btn {
  border-color: var(--color-border);
  background: var(--color-panel);
  color: var(--color-text-muted);
}

.property-panel__danger-btn:hover {
  border-color: var(--color-soft-accent);
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.property-panel__danger-btn--block {
  border-color: rgb(95 111 82 / 28%);
  background: var(--color-action-soft);
  color: var(--color-action);
}

.property-panel__module-actions {
  border-top-color: var(--color-border);
}
</style>
