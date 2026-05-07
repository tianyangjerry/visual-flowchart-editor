<template>
  <details class="api-shell" open>
    <summary class="api-shell__summary">
      <div class="section-head compact">
        <div>
          <p class="eyebrow">External API</p>
          <h3>Modules should be triggered by external systems through these endpoints</h3>
        </div>
      </div>
    </summary>

    <div v-if="modules.length" class="api-list">
      <article v-for="module in modules" :key="module.code" class="api-card">
        <div class="api-card__header">
          <div>
            <p class="api-card__label">Module name</p>
            <strong>{{ module.label }}</strong>
          </div>
          <button
            class="api-copy-btn"
            type="button"
            @click="$emit('copyApiUrl', module.triggerUrl)"
          >
            {{ copiedApiUrl === module.triggerUrl ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <div class="api-card__row">
          <span class="api-card__label">Module code</span>
          <strong>{{ module.code }}</strong>
        </div>
        <div class="api-card__row">
          <span class="api-card__label">Status</span>
          <span class="status-pill" :class="getStatusClass(module.status)">
            {{ module.status }}
          </span>
        </div>
        <div class="api-card__row api-card__row--stacked">
          <span class="api-card__label">Trigger URL</span>
          <code class="api-card__url">{{ module.triggerUrl }}</code>
          <div class="api-card__example">
            <span>Example API</span>
            <code>POST {{ module.triggerUrl }}</code>
          </div>
        </div>
        <div class="api-card__row">
          <span class="api-card__label">Required fields</span>
          <span>{{ module.requiredFieldsText }}</span>
        </div>
      </article>
    </div>

    <p v-else class="empty-inline">No API modules configured yet.</p>
  </details>
</template>

<script setup>
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

defineOptions({
  name: 'ApiModulesPanel',
})
</script>
