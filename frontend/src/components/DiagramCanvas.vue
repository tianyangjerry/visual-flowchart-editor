<template>
  <div class="diagram-canvas" @click="handleCanvasClick">
    <svg
      ref="svgElement"
      class="diagram-canvas__svg"
      viewBox="0 0 1600 900"
      @pointermove="handlePointerMove"
      @pointerup="stopDrag"
      @pointerleave="stopDrag"
    >
      <GlowDefs />

      <line
        v-if="dragGuide.isVisible"
        class="diagram-canvas__snap-guide"
        :x1="0"
        :x2="1600"
        :y1="dragGuide.y"
        :y2="dragGuide.y"
      />

      <FlowEdge
        v-for="edge in renderableEdges"
        :key="edge.id"
        :edge="edge"
        :source-node="nodeMap[edge.source]"
        :target-node="nodeMap[edge.target]"
        :is-selected="
          (diagramStore.selection.type === 'edge' && diagramStore.selection.id === edge.id) ||
          highlightedEdgeIds.has(edge.id)
        "
        @edge-clicked="diagramStore.selectEdge"
      />

      <FlowNode
        v-for="node in renderableNodes"
        :key="node.id"
        :node="node"
        :is-selected="diagramStore.selection.type === 'node' && diagramStore.selection.id === node.id"
        :is-linked="linkedNodeIds.has(node.id)"
        :connect-state="resolveConnectState(node.id)"
        :connect-hint="resolveConnectHint(node.id)"
        @node-clicked="handleNodeClicked"
        @node-drag-start="startDrag"
        @node-hover="handleNodeHover"
      />
    </svg>

    <div v-if="connectValidationMessage" class="diagram-canvas__connect-hint is-invalid">
      {{ connectValidationMessage }}
    </div>

    <ConfirmDialog
      v-model:show="isRuleDialogVisible"
      title="Connection not allowed"
      :message="ruleDialogMessage"
      confirm-text="Got it"
      cancel-text="Close"
      @confirm="closeRuleDialog"
      @cancel="closeRuleDialog"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

import { useDiagramStore } from '../stores/diagramStore'
import FlowNode from './FlowNode.vue'
import FlowEdge from './FlowEdge.vue'
import GlowDefs from './GlowDefs.vue'
import ConfirmDialog from './ConfirmDialog.vue'

defineOptions({
  name: 'DiagramCanvas',
})

const diagramStore = useDiagramStore()
const svgElement = ref(null)

const SNAP_THRESHOLD = 8

const dragState = reactive({
  isDragging: false,
  nodeId: null,
  pointerOffsetX: 0,
  pointerOffsetY: 0,
  hasMoved: false,
})

const dragGuide = reactive({
  isVisible: false,
  y: 0,
})

const isRuleDialogVisible = ref(false)
const ruleDialogMessage = ref('')

const hoveredNodeId = ref(null)
const connectValidationMessage = computed(() => {
  if (diagramStore.mode !== 'connect' || !diagramStore.pendingSourceNodeId || !hoveredNodeId.value) {
    return null
  }
  return diagramStore.getEdgeValidationMessage(diagramStore.pendingSourceNodeId, hoveredNodeId.value)
})

const nodeMap = computed(() => {
  const map = {}
  for (const node of diagramStore.nodes) {
    map[node.id] = node
  }
  return map
})

const renderableNodes = computed(() => {
  return diagramStore.nodes.filter((node) => {
    return node && typeof node.id === 'string'
  })
})

const renderableEdges = computed(() => {
  return diagramStore.edges.filter((edge) => {
    if (!edge || typeof edge.id !== 'string') {
      return false
    }
    return Boolean(nodeMap.value[edge.source] && nodeMap.value[edge.target])
  })
})

const linkedNodeIds = computed(() => {
  if (diagramStore.selection.type !== 'node') {
    return new Set()
  }

  const selectedNodeId = diagramStore.selection.id
  const nextNodeIds = new Set()

  for (const edge of renderableEdges.value) {
    if (edge.source === selectedNodeId) {
      nextNodeIds.add(edge.target)
      continue
    }

    if ((edge.style?.direction ?? 'forward') === 'both' && edge.target === selectedNodeId) {
      nextNodeIds.add(edge.source)
    }
  }

  return nextNodeIds
})

const highlightedEdgeIds = computed(() => {
  if (diagramStore.selection.type !== 'node') {
    return new Set()
  }

  const selectedNodeId = diagramStore.selection.id
  const edgeIds = new Set()

  for (const edge of renderableEdges.value) {
    if (edge.source === selectedNodeId) {
      edgeIds.add(edge.id)
      continue
    }

    if ((edge.style?.direction ?? 'forward') === 'both' && edge.target === selectedNodeId) {
      edgeIds.add(edge.id)
    }
  }

  return edgeIds
})

function getSvgPoint(event) {
  const svg = svgElement.value
  if (!svg) {
    return { x: 0, y: 0 }
  }
  const rect = svg.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1600,
    y: ((event.clientY - rect.top) / rect.height) * 900,
  }
}

function handleNodeClicked(nodeId) {
  if (diagramStore.mode === 'connect') {
    if (!diagramStore.pendingSourceNodeId) {
      diagramStore.pendingSourceNodeId = nodeId
      diagramStore.selectNode(nodeId)
      return
    }

    const sourceNodeId = diagramStore.pendingSourceNodeId
    const createdEdge = diagramStore.addEdge(sourceNodeId, nodeId)
    diagramStore.pendingSourceNodeId = null

    if (!createdEdge) {
      const message = diagramStore.getEdgeValidationMessage(sourceNodeId, nodeId)
      if (message) {
        ruleDialogMessage.value = message
        isRuleDialogVisible.value = true
      }
      diagramStore.selectNode(nodeId)
    }
    return
  }

  diagramStore.selectNode(nodeId)
}

function startDrag(payload) {
  if (diagramStore.mode !== 'select') {
    return
  }

  const node = nodeMap.value[payload.nodeId]
  if (!node) {
    return
  }

  const point = getSvgPoint(payload.event)
  diagramStore.beginNodeDrag()
  dragState.isDragging = true
  dragState.nodeId = payload.nodeId
  const nodeX = node.layout?.x ?? node.x ?? 0
  const nodeY = node.layout?.y ?? node.y ?? 0

  dragState.pointerOffsetX = point.x - nodeX
  dragState.pointerOffsetY = point.y - nodeY
  dragState.hasMoved = false
  diagramStore.selectNode(payload.nodeId)
}

function handlePointerMove(event) {
  if (!dragState.isDragging || !dragState.nodeId) {
    return
  }

  const point = getSvgPoint(event)
  const nextX = point.x - dragState.pointerOffsetX
  let nextY = point.y - dragState.pointerOffsetY

  const draggingNode = nodeMap.value[dragState.nodeId]
  if (draggingNode) {
    const draggingHeight = draggingNode.layout?.height ?? draggingNode.height ?? 120
    const draggingCenterY = nextY + draggingHeight / 2

    let snappedCenterY = null
    for (const node of renderableNodes.value) {
      if (node.id === dragState.nodeId) {
        continue
      }
      const nodeY = node.layout?.y ?? node.y ?? 0
      const nodeHeight = node.layout?.height ?? node.height ?? 120
      const otherCenterY = nodeY + nodeHeight / 2

      if (Math.abs(otherCenterY - draggingCenterY) < SNAP_THRESHOLD) {
        snappedCenterY = otherCenterY
        break
      }
    }

    if (snappedCenterY !== null) {
      nextY = snappedCenterY - draggingHeight / 2
      dragGuide.isVisible = true
      dragGuide.y = snappedCenterY
    } else {
      dragGuide.isVisible = false
    }
  }

  diagramStore.setNodePosition(dragState.nodeId, nextX, nextY)
  dragState.hasMoved = true
}

function stopDrag() {
  if (!dragState.isDragging) {
    return
  }

  dragState.isDragging = false
  dragState.nodeId = null
  dragState.hasMoved = false
  dragGuide.isVisible = false
}

function handleNodeHover(payload) {
  if (payload.phase === 'enter') {
    hoveredNodeId.value = payload.nodeId
    return
  }

  if (hoveredNodeId.value === payload.nodeId) {
    hoveredNodeId.value = null
  }
}

function resolveConnectState(nodeId) {
  if (diagramStore.mode !== 'connect' || !diagramStore.pendingSourceNodeId) {
    return 'none'
  }

  if (diagramStore.pendingSourceNodeId === nodeId) {
    return 'none'
  }

  const message = diagramStore.getEdgeValidationMessage(diagramStore.pendingSourceNodeId, nodeId)
  return message ? 'invalid' : 'valid'
}

function resolveConnectHint(nodeId) {
  if (hoveredNodeId.value !== nodeId) {
    return ''
  }

  const message = diagramStore.getEdgeValidationMessage(diagramStore.pendingSourceNodeId, nodeId)
  return message ?? ''
}

function closeRuleDialog() {
  isRuleDialogVisible.value = false
  ruleDialogMessage.value = ''
}

function handleCanvasClick() {
  if (diagramStore.mode === 'connect') {
    diagramStore.pendingSourceNodeId = null
  }
  hoveredNodeId.value = null
  diagramStore.clearSelection()
}
</script>

<style scoped>
.diagram-canvas {
  width: 100%;
  height: 100%;
  padding: 12px;
  position: relative;
}

.diagram-canvas__svg {
  width: 100%;
  height: 100%;
  display: block;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 6%),
    0 8px 28px rgb(0 0 0 / 30%);
  background:
    linear-gradient(180deg, rgb(40 43 52 / 96%), rgb(34 37 46 / 98%)),
    radial-gradient(circle, var(--color-canvas-grid) 1px, transparent 1.8px),
    radial-gradient(circle, var(--color-canvas-grid-strong) 1.2px, transparent 2.1px);
  background-size:
    100% 100%,
    18px 18px,
    96px 96px;
  background-position:
    0 0,
    0 0,
    9px 9px;
}

.diagram-canvas__snap-guide {
  stroke: rgb(255 255 255 / 72%);
  stroke-width: 1.5;
  stroke-dasharray: 8 6;
  pointer-events: none;
}

.diagram-canvas__connect-hint {
  position: absolute;
  left: 20px;
  bottom: 20px;
  max-width: min(560px, calc(100% - 40px));
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.45;
  backdrop-filter: blur(6px);
  border: 1px solid;
}

.diagram-canvas__connect-hint.is-invalid {
  color: #fecdd3;
  border-color: rgb(251 113 133 / 50%);
  background: rgb(63 19 30 / 68%);
}
</style>
