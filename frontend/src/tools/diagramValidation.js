function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]))
}

function getIncomingEdgeCount(nodes, edges, nodeId) {
  return edges.filter((edge) => edge.target === nodeId && nodes.some((node) => node.id === edge.source)).length
}

function getOutgoingEdgeCount(nodes, edges, nodeId) {
  return edges.filter((edge) => edge.source === nodeId && nodes.some((node) => node.id === edge.target)).length
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

export function getEdgeValidationError(sourceNode, targetNode, nodes = [], edges = []) {
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

export function getConnectivityIssues(nodes, edges) {
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
  }

  return issues
}
