<template>
  <article class="project-list-shell">
    <div v-if="isWorkflowComplete" class="completion-banner">
      <div>
        <p class="eyebrow eyebrow--success">Workflow completed</p>
        <h2>All modules have completed successfully.</h2>
      </div>
      <div class="completion-banner__meta">
        <span>Completed on: {{ workflowCompletedAt }}</span>
        <span>Total steps completed: {{ approvedStepCount }}</span>
      </div>
    </div>

    <div class="section-head">
      <div>
        <p class="eyebrow">Projects</p>
        <h2>Project cards</h2>
      </div>
      <span class="count-chip">{{ projects.length }} projects</span>
    </div>

    <div v-if="projects.length" class="project-list">
      <RouterLink
        v-for="project in projects"
        :key="project.id"
        class="project-card project-card--link"
        :class="{ active: project.id === selectedProjectId }"
        :to="{ path: '/editor', query: { flowchartId: project.id } }"
        @click="$emit('selectProject', project.id)"
      >
        <button
          class="delete-btn"
          type="button"
          aria-label="Delete project"
          @click.stop.prevent="$emit('deleteProject', project)"
        >
          <Trash2 :size="14" />
        </button>

        <div class="project-card__header">
          <strong>{{ project.name }}</strong>
        </div>
        <div class="project-card__subheader">
          <span class="status-pill" :class="`status-${project.status}`">{{ project.status }}</span>
        </div>
        <p>{{ project.description }}</p>
        <div class="project-card__meta">
          <span>Progress {{ project.progress }}%</span>
          <span>{{ project.updatedAt }}</span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="empty-state">
      <h3>No projects yet</h3>
      <p>Save a flowchart from the editor and it will appear here.</p>
    </div>
  </article>
</template>

<script setup>
import { Trash2 } from 'lucide-vue-next'

defineProps({
  approvedStepCount: {
    type: Number,
    required: true,
  },
  isWorkflowComplete: {
    type: Boolean,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
  selectedProjectId: {
    type: [String, Number],
    default: null,
  },
  workflowCompletedAt: {
    type: String,
    required: true,
  },
})

defineEmits(['deleteProject', 'selectProject'])

defineOptions({
  name: 'ProjectListPanel',
})
</script>
