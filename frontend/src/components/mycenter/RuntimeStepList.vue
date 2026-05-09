<template>
  <div class="step-list-shell">
    <div class="section-head compact">
      <div>
        <h3>Recent runs</h3>
      </div>
    </div>

    <div class="runtime-table" role="table" aria-label="Recent runtime steps">
      <div class="runtime-table__row runtime-table__row--head" role="row">
        <span role="columnheader">Step</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Updated</span>
      </div>

      <div
        v-for="step in steps"
        :key="step.key"
        class="runtime-table__row"
        :class="{ 'is-active': activeStep?.key === step.key }"
        role="row"
      >
        <strong role="cell">{{ step.label }}</strong>
        <span role="cell">
          <span class="status-pill" :class="getStatusClass(step.status)">
            {{ getStatusLabel(step.status) }}
          </span>
        </span>
        <span role="cell">{{ step.updatedAt }}</span>
      </div>
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

defineOptions({
  name: 'RuntimeStepList',
})
</script>
