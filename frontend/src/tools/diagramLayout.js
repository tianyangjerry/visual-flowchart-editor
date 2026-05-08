function sortNodeByLayout(aNode, bNode) {
  if (aNode.layout.y !== bNode.layout.y) {
    return aNode.layout.y - bNode.layout.y
  }
  return aNode.layout.x - bNode.layout.x
}

function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]))
}

export function computeLayers(nodes, edges) {
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
