export function clonePlain(value) {
  if (value === undefined) {
    return undefined
  }
  return JSON.parse(JSON.stringify(value))
}

export function cloneDiagramData(state) {
  return {
    nodes: clonePlain(state.nodes),
    edges: clonePlain(state.edges),
    viewport: clonePlain(state.viewport),
  }
}

export function createSnapshot(state) {
  return cloneDiagramData(state)
}
