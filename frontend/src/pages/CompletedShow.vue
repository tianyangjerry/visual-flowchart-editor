<template>
  <main class="completed-page">
    <aside class="completed-sidebar">
      <RouterLink class="sidebar-brand" to="/">
        <Boxes :size="24" />
        <span>My Center</span>
      </RouterLink>

      <nav class="sidebar-nav" aria-label="Completed navigation">
        <RouterLink class="sidebar-nav__item" to="/my-center">
          <FolderKanban :size="18" />
          <span>Saved flows</span>
        </RouterLink>
        <RouterLink class="sidebar-nav__item is-active" to="/completed">
          <CheckCircle2 :size="18" />
          <span>Completed</span>
        </RouterLink>
      </nav>

      <div class="completed-location-card">
        <MapPin :size="20" />
        <div>
          <strong>Nanjing</strong>
          <span>Weather location</span>
        </div>
      </div>
    </aside>

    <section class="completed-workspace">
      <header class="completed-header">
        <div>
          <p class="eyebrow">Completed</p>
          <h1>Finished projects</h1>
        </div>
        <span class="count-chip">{{ completedProjects.length }} completed</span>
      </header>

      <section v-if="completedProjects.length" class="completed-grid">
        <article v-for="project in completedProjects" :key="project.id" class="completed-card">
          <ProjectFlowSnapshot :project="project" />
          <div class="completed-card__body">
            <div>
              <h2>{{ project.name }}</h2>
              <p>{{ project.description }}</p>
            </div>
            <div class="completed-card__meta">
              <span>Updated</span>
              <strong>{{ project.updatedAt }}</strong>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="completed-empty">
        <CheckCircle2 :size="30" />
        <h2>No completed projects yet</h2>
        <p>Completed workflows will appear here after every step is finished.</p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Boxes, CheckCircle2, FolderKanban, MapPin } from 'lucide-vue-next'

import ProjectFlowSnapshot from '../components/mycenter/ProjectFlowSnapshot.vue'
import { useProjectProgressStore } from '../stores/projectProgress'
import '../styles/myCenter.css'
import '../styles/completedShow.css'

const progressStore = useProjectProgressStore()
const { projects } = storeToRefs(progressStore)

const completedProjects = computed(() =>
  projects.value.filter((project) => project.status === 'completed' || project.progress === 100),
)

onMounted(async () => {
  if (!progressStore.isLoaded) {
    await progressStore.syncProjects()
  }
})

defineOptions({
  name: 'CompletedShow',
})
</script>
