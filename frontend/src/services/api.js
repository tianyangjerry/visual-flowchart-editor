const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

async function safeRequest(path, options = {}) {
  try {
    return await request(path, options)
  } catch (error) {
    console.error(`API request failed: ${path}`, error)
    return null
  }
}

export function listWorkflowDefinitions() {
  return safeRequest('/workflow/definitions')
}

export function getWorkflowDefinition(id) {
  return safeRequest(`/workflow/definitions/${id}`)
}

export function saveWorkflowDefinition(definition) {
  return safeRequest('/workflow/definitions', {
    method: 'POST',
    body: JSON.stringify(definition),
  })
}

export function deleteWorkflowDefinition(id) {
  return safeRequest(`/workflow/definitions/${id}`, {
    method: 'DELETE',
  })
}

export function getWorkflowRuntime(workflowId) {
  return safeRequest(`/workflow/${workflowId}/runtime`)
}

export function triggerWorkflowModule(workflowId, moduleCode, payload = {}) {
  return safeRequest(`/workflow/${workflowId}/module/${moduleCode}/trigger`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const listFlowcharts = listWorkflowDefinitions
export const getFlowchart = getWorkflowDefinition
export const saveFlowchart = saveWorkflowDefinition
export const deleteFlowchart = deleteWorkflowDefinition
