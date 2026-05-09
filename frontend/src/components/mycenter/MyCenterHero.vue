<template>
  <header class="hero-shell">
    <div>
      <h1>Saved working flows</h1>
      <p class="hero-copy">
        Manage your saved projects here. Open a flow, inspect its details, or remove it when you no
        longer need it.
      </p>
    </div>

    <RouterLink class="hero-action" to="/editor">
      <span>Open Editor</span>
      <ExternalLink :size="16" />
    </RouterLink>
  </header>
</template>

<script setup>
import { ExternalLink } from 'lucide-vue-next'

defineOptions({
  name: 'MyCenterHero',
})
</script>
