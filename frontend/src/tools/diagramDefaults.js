export function createDefaultViewport() {
  return {
    x: 0,
    y: 0,
    zoom: 1,
  }
}

export function createDefaultWorkflowConfig(partialNode = {}) {
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

export function createDefaultNode(partialNode = {}) {
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

export function createDefaultEdge(sourceNodeId, targetNodeId, partialEdge = {}) {
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
