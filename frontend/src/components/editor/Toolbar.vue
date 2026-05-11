<template>
  <div class="toolbar">
    <div class="toolbar__left">
      <RouterLink class="toolbar__brand" to="/">
        <Sparkles class="toolbar__brand-icon" :size="14" />
        <span class="toolbar__brand-text">Visual Diagram Editor</span>
      </RouterLink>

      <div class="toolbar__actions-group">
        <button class="toolbar__item" type="button" @click="createNewDiagram">
          <FilePlus2 :size="15" />
          <span>New</span>
        </button>
        <button class="toolbar__item" type="button" @click="openSaveDialog">
          <Save :size="15" />
          <span>Save</span>
        </button>

        <label class="toolbar__item" for="json-file-input">
          <FileInput :size="15" />
          <span>Import</span>
        </label>
        <input
          id="json-file-input"
          class="toolbar__hidden-input"
          type="file"
          accept="application/json"
          @change="importDiagram"
        />

        <button class="toolbar__item" type="button" @click="downloadDiagram">
          <FileOutput :size="15" />
          <span>Export</span>
        </button>
        <button class="toolbar__item" type="button" @click="diagramStore.clearDiagram">
          <Trash2 :size="15" />
          <span>Clear</span>
        </button>
      </div>
    </div>

    <div class="toolbar__right">
      <RouterLink class="toolbar__about" to="/my-center">
        <Info :size="15" />
        <span>My Center</span>
      </RouterLink>
      <button class="toolbar__about" type="button" @click="diagramStore.openRulesDialog()">
        <Info :size="15" />
        <span>About</span>
      </button>
    </div>
  </div>

  <div v-if="saveStatus" class="toolbar__status" :class="`toolbar__status--${saveStatusType}`">
    {{ saveStatus }}
  </div>

  <n-modal v-model:show="showSaveModal" preset="card" style="width: min(440px, calc(100vw - 32px))">
    <template #header>
      <div class="save-modal__title">Name this flow</div>
    </template>

    <div class="save-modal__content">
      <p>Give this project a unique name so it can be distinguished from other saved flows.</p>
      <n-input v-model:value="projectNameDraft" placeholder="Enter project name" maxlength="60" />
      <p v-if="nameError" class="save-modal__error">{{ nameError }}</p>
    </div>

    <template #footer>
      <n-space justify="end" :size="10">
        <n-button tertiary :disabled="isSaving" @click="showSaveModal = false">Cancel</n-button>
        <n-button type="primary" :loading="isSaving" :disabled="isSaveDisabled" @click="confirmSave">Save</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { computed, ref } from 'vue'

import { FileInput, FileOutput, FilePlus2, Info, Save, Sparkles, Trash2 } from 'lucide-vue-next'

import { NButton, NInput, NModal, NSpace, useMessage } from 'naive-ui'

import { useDiagramStore } from '../../stores/diagramStore.js'
import { useProjectProgressStore } from '../../stores/projectProgress.js'

defineOptions({
  name: 'EditorToolbar',
})

const STORAGE_KEY = 'visual-flowchart-editor-diagram'
const diagramStore = useDiagramStore()
const progressStore = useProjectProgressStore()
const message = useMessage()
const showSaveModal = ref(false)
const projectNameDraft = ref('')
const isSaving = ref(false)
const nameError = ref('')
const saveStatus = ref('')
const saveStatusType = ref('info')

const isSaveDisabled = computed(() => isSaving.value)

function createNewDiagram() {
  diagramStore.clearDiagram()
}

function openSaveDialog() {
  projectNameDraft.value = diagramStore.exportDiagram()?.meta?.name ?? ''
  nameError.value = ''
  saveStatus.value = ''
  showSaveModal.value = true
}

async function confirmSave() {
  const projectName = projectNameDraft.value.trim()
  if (!projectName) {
    nameError.value = 'Project name is required.'
    return
  }

  isSaving.value = true
  saveStatusType.value = 'info'
  saveStatus.value = 'Saving to backend...'

  try {
    const payload = diagramStore.exportDiagram()
    payload.meta = {
      ...(payload.meta ?? {}),
      name: projectName,
    }
    const saved = await progressStore.upsertProjectFromDiagram(payload, {
      projectId: payload?.id,
      name: projectName,
      description: 'Saved from the editor and linked to My Center.',
      status: 'doing',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    })

    diagramStore.loadDiagram({
      ...payload,
      id: saved.id,
      meta: {
        ...(payload.meta ?? {}),
        name: saved.name,
        description: saved.description,
      },
    })

    showSaveModal.value = false
    saveStatusType.value = 'success'
    saveStatus.value = 'Save successful'
    message.success(`Saved as ${projectName}`)
  } catch (error) {
    console.error('Save failed:', error)
    saveStatusType.value = 'error'
    saveStatus.value = 'Save failed'
    message.error('Save failed')
  } finally {
    isSaving.value = false
  }
}

function downloadDiagram() {
  const payload = diagramStore.exportDiagram()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'visual-flowchart.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

async function importDiagram(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const parsedData = JSON.parse(text)
    diagramStore.loadDiagram(parsedData)
    progressStore.upsertProjectFromDiagram(parsedData, {
      projectId: parsedData?.id ?? `project_${Date.now()}`,
      name: parsedData?.meta?.name ?? 'Imported Working Flow',
      description: 'Imported from a JSON file and linked to My Center.',
      status: 'doing',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    })
    message.success('Saved')
    message.success('Updated My Center')
  } catch (error) {
    console.error('Failed to import diagram json:', error)
    window.alert('Import failed: invalid JSON file.')
  } finally {
    event.target.value = ''
  }
}
</script>

<style scoped>
.toolbar {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}
.toolbar__left,
.toolbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  min-width: 252px;
  height: 38px;
  border-radius: 8px;
  background: var(--color-bg-elevated);
  color: inherit;
  text-decoration: none;
}
.toolbar__brand:hover {
  background: #ede7dd;
}
.toolbar__brand-icon {
  color: var(--color-action);
}
.toolbar__brand-text {
  font-weight: 600;
  letter-spacing: 0;
}
.toolbar__actions-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 8px;
  background: var(--color-bg-elevated);
  box-shadow: inset 0 0 0 1px var(--color-border);
}
.toolbar__item {
  border: 0;
  background: transparent;
  color: var(--color-text);
  padding: 0 14px;
  height: 34px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.toolbar__item:hover {
  background: var(--color-panel);
}
.toolbar__about {
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  color: var(--color-text);
  height: 34px;
  border-radius: 8px;
  padding: 0 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.toolbar__about:hover {
  background: var(--color-bg-elevated);
}
.toolbar__hidden-input {
  display: none;
}

.toolbar__status {
  padding: 8px 14px;
  font-size: 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.toolbar__status--success {
  color: var(--color-action);
}

.toolbar__status--error {
  color: #8a5a4c;
}

.toolbar__status--info {
  color: var(--color-text-muted);
}
</style>
