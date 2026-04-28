import { defineStore } from 'pinia'

const HISTORY_LIMIT = 100

function createDefaultViewport() {
  return {
    x: 0,
    y: 0,
    zoom: 1,
  }
}

function clonePlain(value) {
  if (value === undefined) {
    return undefined
  }
  return JSON.parse(JSON.stringify(value))
}

function createDefaultWorkflowConfig(partialNode = {}) {
  const isBoundaryNode = partialNode.type === 'start' || partialNode.type === 'end'
  const triggerMode = isBoundaryNode
    ? 'auto'
    : ['manual', 'api'].includes(partialNode.workflow?.triggerMode)
      ? partialNode.workflow.triggerMode
      : 'manual'

  return {
    triggerMode,
    requiredFields: Array.isArray(partialNode.workflow?.requiredFields)
      ? partialNode.workflow.requiredFields
      : [],
    triggerUrl: partialNode.workflow?.triggerUrl ?? '',
    nextAction: partialNode.workflow?.nextAction ?? '',
    conditionExpression: partialNode.workflow?.conditionExpression ?? '',
    trueTarget: partialNode.workflow?.trueTarget ?? '',
    falseTarget: partialNode.workflow?.falseTarget ?? '',
    status: partialNode.workflow?.status ?? partialNode.status ?? 'active',
  }
}

function createDefaultNode(partialNode = {}) {
  const nodeType = partialNode.type ?? 'task'

  return {
    id: `node_${crypto.randomUUID()}`,
    type: nodeType,
    title: partialNode.title ?? (nodeType === 'start' ? 'Start' : nodeType === 'end' ? 'End' : 'New Task'),
    subtitle: partialNode.subtitle ?? 'Workflow step',
    workflow: createDefaultWorkflowConfig(partialNode),
    requiredFields: Array.isArray(partialNode.requiredFields) ? partialNode.requiredFields : [],
    tags: Array.isArray(partialNode.tags) ? partialNode.tags : [],
    status: partialNode.status ?? 'active',
    terminalKind: partialNode.terminalKind ?? (nodeType === 'end' ? 'end' : 'start'),
    style: {
      variant: partialNode.style?.variant ?? nodeType,
      fill: partialNode.style?.fill ?? '',
      stroke: partialNode.style?.stroke ?? '',
    },
    layout: {
      x: partialNode.layout?.x ?? partialNode.x ?? 120,
      y: partialNode.layout?.y ?? partialNode.y ?? 120,
      width: partialNode.layout?.width ?? partialNode.width ?? 260,
      height: partialNode.layout?.height ?? partialNode.height ?? 140,
    },
    ui: {
      collapsed: partialNode.ui?.collapsed ?? false,
      icon: partialNode.ui?.icon ?? 'chevron-right',
    },
  }
}

function createDefaultEdge(sourceNodeId, targetNodeId, partialEdge = {}) {
  return {
    id: `edge_${crypto.randomUUID()}`,
    source: sourceNodeId,
    target: targetNodeId,
    label: partialEdge.label ?? 'next',
    kind: partialEdge.kind ?? 'workflow',
    style: {
      width: partialEdge.style?.width ?? 7,
      color: partialEdge.style?.color ?? '#88f5ff',
      animated: partialEdge.style?.animated ?? true,
      direction: partialEdge.style?.direction ?? 'forward',
    },
  }
}

function wouldCreateCycle(nodes, edges, sourceNodeId, targetNodeId) {
  const adjacency = new Map()
  for (const node of nodes) {
    adjacency.set(node.id, [])
  }
  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      continue
    }
    adjacency.get(edge.source).push(edge.target)
  }
  const stack = [targetNodeId]
  const visited = new Set()
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === sourceNodeId) {
      return true
    }
    if (visited.has(current)) {
      continue
    }
    visited.add(current)
    for (const next of adjacency.get(current) ?? []) {
      stack.push(next)
    }
  }
  return false
}

function getEdgeValidationError(sourceNode, targetNode, nodes = [], edges = []) {
  if (!sourceNode || !targetNode) {
    return 'Source or target node does not exist.'
  }

  if (sourceNode.id === targetNode.id) {
    return 'A node cannot connect to itself.'
  }

  if (sourceNode.type === 'end') {
    return 'End node cannot have outgoing connections.'
  }

  if (targetNode.type === 'start') {
    return 'Start node cannot have incoming connections.'
  }

  if (sourceNode.type === 'task') {
    const outgoingCount = edges.filter((edge) => edge.source === sourceNode.id).length
    if (outgoingCount >= 1) {
      return 'Task node allows only one main outgoing connection.'
    }
  }

  if (sourceNode.type === 'decision') {
    const outgoingCount = edges.filter((edge) => edge.source === sourceNode.id).length
    if (outgoingCount >= 2) {
      return 'Decision node allows only two outgoing connections.'
    }
  }

  if (sourceNode.type === 'data') {
    const outgoingCount = edges.filter((edge) => edge.source === sourceNode.id).length
    if (outgoingCount >= 1) {
      return 'Data node allows only one outgoing connection.'
    }
  }

  if (targetNode.type === 'start') {
    return 'Start node cannot have incoming connections.'
  }

  if (targetNode.type === 'data') {
    return 'Connections into a data node are not allowed.'
  }

  if (sourceNode.type === 'data' && targetNode.type === 'end') {
    return 'Data node cannot connect directly to End.'
  }

  if (wouldCreateCycle(nodes, edges, sourceNode.id, targetNode.id)) {
    return 'This connection creates a cycle. Please review the workflow carefully.'
  }

  return null
}

function cloneDiagramData(state) {
  return {
    nodes: clonePlain(state.nodes),
    edges: clonePlain(state.edges),
    viewport: clonePlain(state.viewport),
  }
}

function createSnapshot(state) {
  return cloneDiagramData(state)
}

function isNodeSelection(selection) {
  return selection.type === 'node' && typeof selection.id === 'string'
}

function isEdgeSelection(selection) {
  return selection.type === 'edge' && typeof selection.id === 'string'
}

function sortNodeByLayout(aNode, bNode) {
  if (aNode.layout.y !== bNode.layout.y) {
    return aNode.layout.y - bNode.layout.y
  }
  return aNode.layout.x - bNode.layout.x
}

function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]))
}

function getIncomingEdgeCount(nodes, edges, nodeId) {
  return edges.filter((edge) => edge.target === nodeId && nodes.some((node) => node.id === edge.source)).length
}

function getOutgoingEdgeCount(nodes, edges, nodeId) {
  return edges.filter((edge) => edge.source === nodeId && nodes.some((node) => node.id === edge.target)).length
}

function getConnectivityIssues(nodes, edges) {
  const nodeMap = buildNodeMap(nodes)
  const issues = []

  for (const node of nodes) {
    const incomingCount = getIncomingEdgeCount(nodes, edges, node.id)
    const outgoingCount = getOutgoingEdgeCount(nodes, edges, node.id)

    if (node.type === 'start') {
      if (incomingCount > 0) issues.push(`${node.title || node.id} cannot have incoming connections.`)
      if (outgoingCount < 1) issues.push(`${node.title || node.id} must connect to the next step.`)
    }

    if (node.type === 'end') {
      if (outgoingCount > 0) issues.push(`${node.title || node.id} cannot have outgoing connections.`)
      if (incomingCount < 1) issues.push(`${node.title || node.id} must receive at least one connection.`)
    }

    if (node.type === 'task' && outgoingCount < 1) {
      issues.push(`${node.title || node.id} must have at least one outgoing connection.`)
    }

    if (node.type === 'decision' && outgoingCount < 2) {
      issues.push(`${node.title || node.id} must branch into at least two connections.`)
    }

    if (!nodeMap.has(node.id)) {
      issues.push(`Node ${node.id} is invalid.`)
    }
  }

  return issues
}

function computeLayers(nodes, edges) {
  const nodeMap = buildNodeMap(nodes)
  const indegreeMap = new Map()
  const outgoingMap = new Map()

  for (const node of nodes) {
    indegreeMap.set(node.id, 0)
    outgoingMap.set(node.id, [])
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      continue
    }
    outgoingMap.get(edge.source).push(edge.target)
    indegreeMap.set(edge.target, (indegreeMap.get(edge.target) ?? 0) + 1)
  }

  const queue = nodes
    .filter((node) => (indegreeMap.get(node.id) ?? 0) === 0)
    .sort(sortNodeByLayout)
    .map((node) => node.id)

  const layerMap = new Map(nodes.map((node) => [node.id, 0]))
  const visited = new Set()

  while (queue.length > 0) {
    const currentId = queue.shift()
    visited.add(currentId)

    const currentLayer = layerMap.get(currentId) ?? 0
    const targets = outgoingMap.get(currentId) ?? []

    for (const targetId of targets) {
      const nextLayer = Math.max(layerMap.get(targetId) ?? 0, currentLayer + 1)
      layerMap.set(targetId, nextLayer)

      indegreeMap.set(targetId, (indegreeMap.get(targetId) ?? 1) - 1)
      if ((indegreeMap.get(targetId) ?? 0) === 0) {
        queue.push(targetId)
      }
    }
  }

  if (visited.size !== nodes.length) {
    let fallbackLayer = Math.max(...layerMap.values(), 0)
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        fallbackLayer += 1
        layerMap.set(node.id, fallbackLayer)
      }
    }
  }

  const layers = new Map()
  for (const node of nodes) {
    const layerIndex = layerMap.get(node.id) ?? 0
    if (!layers.has(layerIndex)) {
      layers.set(layerIndex, [])
    }
    layers.get(layerIndex).push(node)
  }

  for (const [, layerNodes] of layers) {
    layerNodes.sort(sortNodeByLayout)
  }

  return layers
}

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
