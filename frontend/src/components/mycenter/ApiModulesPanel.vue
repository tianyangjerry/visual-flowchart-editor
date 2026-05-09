<template>
  <section class="api-shell">
    <div class="section-head compact">
      <div>
        <h3>Modules</h3>
      </div>
    </div>

    <div v-if="modules.length" class="api-table" role="table" aria-label="Workflow modules">
      <div class="api-table__row api-table__row--head" role="row">
        <span role="columnheader">Module name</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Trigger</span>
        <span role="columnheader">Actions</span>
      </div>

      <div v-for="module in modules" :key="module.code" class="api-table__row" role="row">
        <strong role="cell">{{ module.label }}</strong>
        <span role="cell">
          <span class="status-pill" :class="getStatusClass(module.status)">
            {{ getStatusLabel(module.status) }}
          </span>
        </span>
        <span class="api-table__trigger" role="cell">
          <span>{{ module.requiredFieldsText === '-' ? '-' : module.requiredFieldsText }}</span>
        </span>
        <span class="api-table__actions" role="cell">
          <button class="icon-action" type="button" :title="module.triggerUrl">
            <Eye :size="16" />
          </button>
          <button class="icon-action" type="button" @click="$emit('copyApiUrl', module.triggerUrl)">
            <Check v-if="copiedApiUrl === module.triggerUrl" :size="16" />
            <Copy v-else :size="16" />
          </button>
        </span>
      </div>
    </div>

    <p v-else class="empty-inline">No API modules configured yet.</p>
  </section>
</template>

<script setup>
import { Check, Copy, Eye } from 'lucide-vue-next'

defineProps({
  copiedApiUrl: {
    type: String,
    required: true,
  },
  modules: {
    type: Array,
    required: true,
  },
})

defineEmits(['copyApiUrl'])

function getStatusClass(status) {
  if (status === 'active') return 'status-active'
  if (status === 'completed') return 'status-completed'
  return 'status-not-started'
}

function getStatusLabel(status) {
  if (status === 'active') return 'Active'
  if (status === 'completed') return 'Completed'
  return 'Not started'
}

defineOptions({
  name: 'ApiModulesPanel',
})
</script>
