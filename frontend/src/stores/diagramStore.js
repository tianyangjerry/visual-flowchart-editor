import { defineStore } from 'pinia'
import { createDefaultEdge, createDefaultNode, createDefaultViewport } from '@/tools/diagramDefaults'
import { computeLayers } from '@/tools/diagramLayout'
import { isEdgeSelection, isNodeSelection } from '@/tools/diagramSelection'
import { cloneDiagramData, clonePlain, createSnapshot } from '@/tools/diagramSnapshot'
import { getConnectivityIssues, getEdgeValidationError } from '@/tools/diagramValidation'

const HISTORY_LIMIT = 100

export const useDiagramStore = defineStore('diagram', {
  state: () => ({
    schemaVersion: 2,
    nodes: [],
    edges: [],
    selection: {
      type: null,
      id: null,
    },
    viewport: createDefaultViewport(),
    mode: 'select',
    pendingSourceNodeId: null,
    runtime: {
      workflowId: null,
      status: 'not_started',
      currentNodeId: null,
      completedNodeIds: [],
      triggerMap: {},
      lastResult: null,
    },
    ui: {
      showRulesDialog: false,
    },
    history: {
      undoStack: [],
      redoStack: [],
    },
  }),

  getters: {
    selectedNode(state) {
      if (!isNodeSelection(state.selection)) {
        return null
      }
      return state.nodes.find((node) => node.id === state.selection.id) ?? null
    },
    selectedEdge(state) {
      if (!isEdgeSelection(state.selection)) {
        return null
      }
      return state.edges.find((edge) => edge.id === state.selection.id) ?? null
    },
  },

  actions: {
    pushHistory() {
      this.history.undoStack.push(createSnapshot(this))
      if (this.history.undoStack.length > HISTORY_LIMIT) {
        this.history.undoStack.shift()
      }
      this.history.redoStack = []
    },

    restoreSnapshot(snapshot) {
      this.nodes = clonePlain(snapshot.nodes)
      this.edges = clonePlain(snapshot.edges)
      this.viewport = clonePlain(snapshot.viewport)
      this.clearSelection()
      this.pendingSourceNodeId = null
    },

    setRuntime(runtime = {}) {
      this.runtime = {
        workflowId: runtime.workflowId ?? this.runtime.workflowId ?? null,
        status: runtime.status ?? 'not_started',
        currentNodeId: runtime.currentNodeId ?? null,
        completedNodeIds: Array.isArray(runtime.completedNodeIds) ? runtime.completedNodeIds : [],
        triggerMap: runtime.triggerMap ?? {},
        lastResult: runtime.lastResult ?? null,
      }
    },

    undo() {
      const previous = this.history.undoStack.pop()
      if (!previous) {
        return
      }
      this.history.redoStack.push(createSnapshot(this))
      this.restoreSnapshot(previous)
    },

    redo() {
      const next = this.history.redoStack.pop()
      if (!next) {
        return
      }
      this.history.undoStack.push(createSnapshot(this))
      this.restoreSnapshot(next)
    },

    loadDiagram(payload) {
      const nodes = Array.isArray(payload?.nodes) ? payload.nodes : []
      const edges = Array.isArray(payload?.edges) ? payload.edges : []
      this.nodes = nodes
      this.edges = edges
      this.viewport = payload?.viewport ?? createDefaultViewport()
      this.clearSelection()
      this.pendingSourceNodeId = null
      this.runtime.workflowId = payload?.workflowId ?? payload?.id ?? this.runtime.workflowId ?? null
    },

    exportDiagram() {
      return {
        schemaVersion: this.schemaVersion,
        ...cloneDiagramData(this),
      }
    },

    validateWorkflowDefinition() {
      const issues = getConnectivityIssues(this.nodes, this.edges)
      if (issues.length > 0) {
        return { valid: false, issues }
      }
      return { valid: true, issues: [] }
    },

    setMode(mode) {
      this.mode = mode
      if (mode !== 'connect') {
        this.pendingSourceNodeId = null
      }
    },

    addNode(partialNode = {}) {
      this.pushHistory()
      const createdNode = createDefaultNode(partialNode)
      this.nodes.push(createdNode)
      this.selection = { type: 'node', id: createdNode.id }
      return createdNode
    },

    getWorkflowNodeCountByMode(triggerMode) {
      return this.nodes.filter((node) => node.workflow?.triggerMode === triggerMode).length
    },

    updateNode(nodeId, patch) {
      const targetNode = this.nodes.find((node) => node.id === nodeId)
      if (!targetNode) {
        return
      }
      this.pushHistory()
      Object.assign(targetNode, patch)
    },

    updateNodeLayout(nodeId, patch) {
      const targetNode = this.nodes.find((node) => node.id === nodeId)
      if (!targetNode) {
        return
      }
      this.pushHistory()
      targetNode.layout = {
        ...targetNode.layout,
        ...patch,
      }
    },

    beginNodeDrag() {
      this.pushHistory()
    },

    setNodePosition(nodeId, x, y) {
      const targetNode = this.nodes.find((node) => node.id === nodeId)
      if (!targetNode) {
        return
      }
      targetNode.layout.x = x
      targetNode.layout.y = y
    },

    removeNode(nodeId) {
      this.pushHistory()
      this.nodes = this.nodes.filter((node) => node.id !== nodeId)
      this.edges = this.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      if (this.selection.id === nodeId) {
        this.clearSelection()
      }
      if (this.pendingSourceNodeId === nodeId) {
        this.pendingSourceNodeId = null
      }
    },

    addEdge(sourceNodeId, targetNodeId) {
      if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
        return null
      }

      const sourceNode = this.nodes.find((node) => node.id === sourceNodeId)
      const targetNode = this.nodes.find((node) => node.id === targetNodeId)
      if (!sourceNode || !targetNode) {
        return null
      }

      const validationError = getEdgeValidationError(sourceNode, targetNode, this.nodes, this.edges)
      if (validationError) {
        return null
      }

      const hasDuplicate = this.edges.some(
        (edge) => edge.source === sourceNodeId && edge.target === targetNodeId,
      )
      if (hasDuplicate) {
        return null
      }

      this.pushHistory()
      const edge = createDefaultEdge(sourceNodeId, targetNodeId)
      this.edges.push(edge)
      this.selection = { type: 'edge', id: edge.id }
      return edge
    },

    getEdgeValidationMessage(sourceNodeId, targetNodeId) {
      if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
        return 'Cannot connect a node to itself.'
      }

      const sourceNode = this.nodes.find((node) => node.id === sourceNodeId)
      const targetNode = this.nodes.find((node) => node.id === targetNodeId)
      const validationError = getEdgeValidationError(sourceNode, targetNode, this.nodes, this.edges)
      if (validationError) {
        return validationError
      }

      const hasDuplicate = this.edges.some(
        (edge) => edge.source === sourceNodeId && edge.target === targetNodeId,
      )
      if (hasDuplicate) {
        return 'This connection already exists.'
      }

      return null
    },

    updateEdge(edgeId, patch) {
      const targetEdge = this.edges.find((edge) => edge.id === edgeId)
      if (!targetEdge) {
        return
      }
      this.pushHistory()
      Object.assign(targetEdge, patch)
    },

    removeEdge(edgeId) {
      this.pushHistory()
      this.edges = this.edges.filter((edge) => edge.id !== edgeId)
      if (this.selection.id === edgeId) {
        this.clearSelection()
      }
    },

    selectNode(nodeId) {
      this.selection = { type: 'node', id: nodeId }
    },

    selectEdge(edgeId) {
      this.selection = { type: 'edge', id: edgeId }
    },

    clearSelection() {
      this.selection = { type: null, id: null }
    },

    deleteSelection() {
      if (isNodeSelection(this.selection)) {
        this.removeNode(this.selection.id)
        return
      }
      if (isEdgeSelection(this.selection)) {
        this.removeEdge(this.selection.id)
      }
    },

    clearDiagram() {
      this.pushHistory()
      this.nodes = []
      this.edges = []
      this.clearSelection()
      this.pendingSourceNodeId = null
    },

    openRulesDialog() {
      this.ui.showRulesDialog = true
    },

    closeRulesDialog() {
      this.ui.showRulesDialog = false
    },

    autoLayout(options = {}) {
      if (this.nodes.length === 0) {
        return
      }

      const {
        startX = 120,
        startY = 480,
        layerGap = 330,
        nodeGap = 42,
      } = options

      this.pushHistory()

      const layers = computeLayers(this.nodes, this.edges)
      const sortedLayerIndexes = [...layers.keys()].sort((a, b) => a - b)

      for (const layerIndex of sortedLayerIndexes) {
        const layerNodes = layers.get(layerIndex) ?? []

        const layerHeight = layerNodes.reduce((sum, node, index) => {
          const gap = index === 0 ? 0 : nodeGap
          return sum + node.layout.height + gap
        }, 0)

        let offsetY = startY - layerHeight / 2

        for (const node of layerNodes) {
          node.layout.x = startX + layerIndex * layerGap
          node.layout.y = offsetY
          offsetY += node.layout.height + nodeGap
        }
      }
    },
  },
})
