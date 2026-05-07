<template>
  <header class="hero-shell">
    <div>
      <p class="eyebrow">My Center</p>
      <h1>Saved working flows</h1>
      <p class="hero-copy">
        Manage your saved projects here. Open a flow, inspect its details, or remove it when you no
        longer need it.
      </p>
    </div>

    <RouterLink class="hero-action" to="/editor">Open Editor</RouterLink>
  </header>
</template>

<script setup>
defineOptions({
  name: 'MyCenterHero',
})
</script>
