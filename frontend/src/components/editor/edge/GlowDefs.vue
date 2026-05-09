<template>
  <defs>
    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="var(--neon-cyan)" />
      <stop offset="55%" stop-color="var(--neon-blue)" />
      <stop offset="100%" stop-color="var(--neon-purple)" />
    </linearGradient>

    <linearGradient id="node-outline-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(239 236 224 / 90%)" />
      <stop offset="100%" stop-color="rgb(195 104 85 / 78%)" />
    </linearGradient>

    <linearGradient id="node-fill-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(241 240 232 / 14%)" />
      <stop offset="52%" stop-color="rgb(241 240 232 / 4%)" />
      <stop offset="100%" stop-color="rgb(0 0 0 / 30%)" />
    </linearGradient>

    <linearGradient id="node-header-gradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgb(239 236 224 / 18%)" />
      <stop offset="100%" stop-color="rgb(195 104 85 / 16%)" />
    </linearGradient>

    <marker
      id="arrow-head"
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="3.2"
      markerHeight="3.2"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--neon-cyan)" />
    </marker>

    <marker
      id="arrow-head-start"
      viewBox="0 0 10 10"
      refX="2"
      refY="5"
      markerWidth="3.2"
      markerHeight="3.2"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M 10 0 L 0 5 L 10 10 z" fill="var(--neon-cyan)" />
    </marker>

    <filter id="edge-glow" x="-40%" y="-40%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.6" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="0 0 0 0 0.88  0 0 0 0 0.75  0 0 0 0 0.56  0 0 0 0.58 0"
        result="colorBlur"
      />
      <feMerge>
        <feMergeNode in="colorBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="node-glow" x="-50%" y="-50%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4.2" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="0 0 0 0 0.88  0 0 0 0 0.75  0 0 0 0 0.56  0 0 0 0.52 0"
        result="colorBlur"
      />
      <feMerge>
        <feMergeNode in="colorBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
</template>

<script setup>
defineOptions({
  name: 'GlowDefs',
})
</script>
