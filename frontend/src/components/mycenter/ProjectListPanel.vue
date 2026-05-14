<template>
  <article class="project-list-shell">
    <header class="section-head">
      <div>
        <h2>Projects</h2>
      </div>
      <span class="count-chip">{{ filteredProjects.length }} projects</span>
    </header>

    <div class="project-list-actions">
      <RouterLink class="new-project-btn" to="/editor">
        <Plus :size="16" />
        <span>New Project</span>
      </RouterLink>
    </div>

    <label class="project-search">
      <Search :size="17" />
      <input v-model="searchQuery" type="search" placeholder="Search projects" />
    </label>

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

    <div v-if="filteredProjects.length" class="project-list">
      <article
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card project-card--link"
        :class="{ active: project.id === selectedProjectId }"
        role="button"
        tabindex="0"
        @click="$emit('selectProject', project.id)"
        @keydown.enter.prevent="$emit('selectProject', project.id)"
        @keydown.space.prevent="$emit('selectProject', project.id)"
      >
        <button
          class="delete-btn"
          type="button"
          aria-label="Delete project"
          @click.stop.prevent="$emit('deleteProject', project)"
        >
          <Trash2 :size="14" />
        </button>

        <header class="project-card__header">
          <strong>{{ project.name }}</strong>
        </header>
        <div class="project-card__subheader">
          <span class="status-pill" :class="`status-${project.status}`">{{ project.status }}</span>
        </div>
        <p>{{ project.description }}</p>
        <div class="project-card__meta">
          <span>Progress <strong>{{ project.progress }}%</strong></span>
          <span>Updated <strong>{{ project.updatedAt }}</strong></span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>{{ projects.length ? 'No matching projects' : 'No projects yet' }}</h3>
      <p>
        {{
          projects.length
            ? 'Try another project name, status, or description.'
            : 'Save a flowchart from the editor and it will appear here.'
        }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Search, Trash2 } from 'lucide-vue-next'

const props = defineProps({
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

const searchQuery = ref('')

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.projects

  return props.projects.filter((project) =>
    [
      project.name,
      project.description,
      project.status,
      `${project.progress}%`,
      project.updatedAt,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

defineEmits(['deleteProject', 'selectProject'])

defineOptions({
  name: 'ProjectListPanel',
})
</script>
