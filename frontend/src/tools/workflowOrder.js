function getNodeId(node) {
  return node?.id ? String(node.id) : ''
}

function compareNodePosition(aNode, bNode) {
  const aLayout = aNode?.layout ?? {}
  const bLayout = bNode?.layout ?? {}
  const aY = Number(aLayout.y ?? 0)
  const bY = Number(bLayout.y ?? 0)
  if (aY !== bY) return aY - bY

  const aX = Number(aLayout.x ?? 0)
  const bX = Number(bLayout.x ?? 0)
  if (aX !== bX) return aX - bX

  return getNodeId(aNode).localeCompare(getNodeId(bNode))
}

function isStartNode(node) {
  return node?.type === 'start' || node?.terminalKind === 'start'
}

function buildGraph(nodes, edges) {
  const nodeMap = new Map(nodes.map((node) => [getNodeId(node), node]).filter(([id]) => Boolean(id)))
  const incomingCount = new Map([...nodeMap.keys()].map((id) => [id, 0]))
  const outgoingMap = new Map([...nodeMap.keys()].map((id) => [id, []]))

  for (const edge of edges) {
    const sourceId = edge?.source ? String(edge.source) : ''
    const targetId = edge?.target ? String(edge.target) : ''
    if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) continue

    outgoingMap.get(sourceId).push(targetId)
    incomingCount.set(targetId, (incomingCount.get(targetId) ?? 0) + 1)
  }

  for (const [sourceId, targetIds] of outgoingMap) {
    const sortedTargets = [...new Set(targetIds)].sort((aId, bId) =>
      compareNodePosition(nodeMap.get(aId), nodeMap.get(bId)),
    )
    outgoingMap.set(sourceId, sortedTargets)
  }

  return { incomingCount, nodeMap, outgoingMap }
}

function getStartNodes(nodes, incomingCount) {
  const explicitStarts = nodes.filter(isStartNode)
  if (explicitStarts.length > 0) {
    return explicitStarts.sort(compareNodePosition)
  }

  const rootNodes = nodes.filter((node) => (incomingCount.get(getNodeId(node)) ?? 0) === 0)
  if (rootNodes.length > 0) {
    return rootNodes.sort(compareNodePosition)
  }

  return nodes[0] ? [nodes[0]] : []
}

export function orderWorkflowNodes(definition = {}) {
  const nodes = Array.isArray(definition?.nodes) ? definition.nodes : []
  const edges = Array.isArray(definition?.edges) ? definition.edges : []
  if (nodes.length < 2) return nodes

  const { incomingCount, nodeMap, outgoingMap } = buildGraph(nodes, edges)
  const queue = getStartNodes(nodes, incomingCount).map(getNodeId).filter(Boolean)
  const visited = new Set()
  const ordered = []

  while (queue.length > 0) {
    const nodeId = queue.shift()
    if (!nodeId || visited.has(nodeId)) continue

    const node = nodeMap.get(nodeId)
    if (!node) continue

    visited.add(nodeId)
    ordered.push(node)

    for (const targetId of outgoingMap.get(nodeId) ?? []) {
      if (!visited.has(targetId)) queue.push(targetId)
    }
  }

  const remaining = nodes
    .filter((node) => !visited.has(getNodeId(node)))
    .sort(compareNodePosition)

  return [...ordered, ...remaining]
}

export function getActiveNodeIds(runtime = {}) {
  const state = runtime?.runtimeState ?? runtime ?? {}
  const currentNodeIds = Array.isArray(state?.currentNodeIds) ? state.currentNodeIds : []
  const currentNodeId = runtime?.currentNodeId ?? state?.currentNodeId ?? null

  return new Set(
    [...currentNodeIds, currentNodeId]
      .filter(Boolean)
      .map((nodeId) => String(nodeId)),
  )
}
