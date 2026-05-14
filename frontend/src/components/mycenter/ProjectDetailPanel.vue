<template>
  <section class="detail-stack">
    <article class="detail-shell">
      <div class="detail-overview">
        <header class="detail-overview__title">
          <h2>{{ selectedProject.name }}</h2>
          <span class="status-pill status-active">{{ selectedProject.status }}</span>
        </header>

        <div class="detail-grid">
          <div class="detail-card">
            <span class="detail-label">Last updated</span>
            <strong>{{ selectedProject.updatedAt }}</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Active step</span>
            <strong>{{ activeStep?.label ?? 'Completed' }}</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Progress</span>
            <strong>{{ selectedProject.progress }}%</strong>
          </div>
          <div class="detail-card">
            <span class="detail-label">Flow source</span>
            <strong>{{ selectedProject.flowInfo?.source ?? 'editor' }}</strong>
          </div>
        </div>
      </div>

      <ApiModulesPanel
        :modules="apiModules"
        :copied-api-url="copiedApiUrl"
        @copy-api-url="$emit('copyApiUrl', $event)"
      />
    </article>

    <article class="flow-overview-shell">
      <header class="section-head compact">
        <div>
          <h3>Flow overview</h3>
        </div>
      </header>
      <ProjectFlowSnapshot :project="selectedProject" />
    </article>

    <RuntimeStepList :steps="projectSteps" :active-step="activeStep" />
  </section>
</template>

<script setup>
import ApiModulesPanel from './ApiModulesPanel.vue'
import ProjectFlowSnapshot from './ProjectFlowSnapshot.vue'
import RuntimeStepList from './RuntimeStepList.vue'

defineProps({
  activeStep: {
    type: Object,
    default: null,
  },
  apiModules: {
    type: Array,
    required: true,
  },
  copiedApiUrl: {
    type: String,
    required: true,
  },
  projectSteps: {
    type: Array,
    required: true,
  },
  selectedProject: {
    type: Object,
    required: true,
  },
})

defineEmits(['copyApiUrl'])

defineOptions({
  name: 'ProjectDetailPanel',
})
</script>
