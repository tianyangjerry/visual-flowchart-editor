<template>
  <div class="step-list-shell">
    <div class="section-head">
      <div>
        <p class="eyebrow">Runtime</p>
        <h2>Module execution state</h2>
      </div>
      <span class="count-chip">{{ steps.length }} steps</span>
    </div>

    <div class="step-list">
      <article
        v-for="step in steps"
        :key="step.key"
        class="step-card"
        :class="[`step-card--${step.status}`, { 'is-active': activeStep?.key === step.key }]"
      >
        <div class="step-card__grid">
          <div class="step-card__main">
            <div class="step-card__topline">
              <strong class="step-card__title">{{ step.label }}</strong>
              <span class="status-pill" :class="getStatusClass(step.status)">
                {{ getStatusLabel(step.status) }}
              </span>
            </div>

            <p class="step-card__description">{{ getStatusDescription(step.status) }}</p>

            <div class="step-card__meta">
              <span>Key: {{ step.key }}</span>
              <span>Updated: {{ step.updatedAt }}</span>
            </div>
          </div>

          <div class="step-card__side">
            <div v-if="step.status === 'active'" class="step-card__hint">
              Trigger the API to complete this module
            </div>
            <div v-else-if="step.status === 'completed'" class="approved-mark">
              <span class="approved-mark__icon">OK</span>
              <div>
                <strong>Completed</strong>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeStep: {
    type: Object,
    default: null,
  },
  steps: {
    type: Array,
    required: true,
  },
})

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

function getStatusDescription(status) {
  if (status === 'active') return 'Current active module. Waiting for external trigger.'
  if (status === 'completed') return 'Module completed by external API trigger.'
  return 'Blocked until the previous module is completed.'
}

defineOptions({
  name: 'RuntimeStepList',
})
</script>
