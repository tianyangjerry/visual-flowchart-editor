<template>
  <section class="hero" :class="{ 'is-visible': visible }">
    <p class="hero-kicker">Visual Flowchart Editor</p>
    <h1 class="hero-title" aria-label="Build polished workflow diagrams and approvals in one place.">
      <span
        v-for="(char, index) in heroTitleChars"
        :key="`${char}-${index}`"
        class="hero-title__char"
        :style="{ '--i': index }"
      >
        {{ char === ' ' ? '\u00A0' : char }}
      </span>
    </h1>
    <p class="hero-description">
      Design visual flows, guide teams through structured approvals, and keep every project easy
      to scan from first idea to final sign-off.
    </p>
    <div class="hero-actions">
      <RouterLink class="btn btn-primary" to="/editor">Start creating</RouterLink>
      <RouterLink class="btn btn-secondary" to="/my-center">View my center</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  heroTitleChars: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.hero {
  max-width: 1440px;
  margin: 0 auto 28px;
}

.hero {
  position: relative;
  min-height: 72vh;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: 16px;
  overflow: hidden;
  padding: 28px 16px;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  margin: 0;
  color: var(--neon-cyan);
  letter-spacing: 0.1em;
  font-size: 15px;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  max-width: 1320px;
  font-size: clamp(44px, 7vw, 86px);
  line-height: 0.96;
  letter-spacing: -0.065em;
  animation: fade-rise 700ms ease both;
}

.hero-title__char {
  display: inline-block;
  color: rgba(255, 255, 255, 0.28);
  animation: title-sweep-char 4.4s linear infinite;
  animation-delay: calc(var(--i) * 0.08s);
}

.hero-description {
  margin: 0;
  max-width: 980px;
  color: var(--color-text-muted);
  font-size: 26px;
  line-height: 1.9;
  animation: fade-rise 700ms ease 140ms both;
}

.hero-actions {
  position: relative;
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fade-rise 700ms ease 220ms both;
}

.hero-actions::before {
  content: '';
  position: absolute;
  inset: -18px -24px;
  background: radial-gradient(circle, rgb(88 229 255 / 10%), transparent 60%);
  filter: blur(18px);
  z-index: 0;
}

.hero-actions > * {
  position: relative;
  z-index: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 0 30px;
  border-radius: 18px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #5fb6ff, #7c8cff);
  color: #07111c;
  box-shadow: 0 16px 28px rgb(88 229 255 / 12%);
}

.btn-secondary {
  background: rgb(255 255 255 / 3%);
  color: #dbeafe;
  border: 1px solid rgb(126 162 255 / 18%);
}

@keyframes fade-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes title-sweep-char {
  0%,
  18% {
    color: rgb(231 233 238 / 26%);
    text-shadow: none;
  }

  28% {
    color: #fff;
    text-shadow:
      0 0 10px rgb(255 255 255 / 90%),
      0 0 22px rgb(255 255 255 / 60%),
      0 0 38px rgb(136 199 255 / 45%);
  }

  42%,
  100% {
    color: rgb(231 233 238 / 28%);
    text-shadow: none;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 18px;
    border-radius: 20px;
  }

  .hero {
    min-height: auto;
    padding-top: 18px;
  }

  .hero-title {
    font-size: clamp(52px, 14vw, 72px);
  }

  .hero-description {
    font-size: 19px;
  }

  .btn {
    min-height: 52px;
    padding: 0 22px;
    font-size: 16px;
  }

  .hero-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
