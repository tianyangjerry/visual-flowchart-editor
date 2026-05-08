export function isNodeSelection(selection) {
  return selection.type === 'node' && typeof selection.id === 'string'
}

export function isEdgeSelection(selection) {
  return selection.type === 'edge' && typeof selection.id === 'string'
}
