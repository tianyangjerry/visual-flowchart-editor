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
  color: var(--color-accent-muted);
  letter-spacing: 0;
  font-size: 15px;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  max-width: 1320px;
  font-size: clamp(44px, 7vw, 86px);
  line-height: 1;
  letter-spacing: 0;
  animation: fade-rise 700ms ease both;
}

.hero-title__char {
  display: inline-block;
  color: rgb(241 240 232 / 82%);
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
  background: transparent;
  filter: none;
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
  border-radius: 999px;
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
  background: var(--color-accent);
  color: #151410;
  box-shadow: 0 16px 28px rgb(0 0 0 / 24%);
}

.btn-secondary {
  background: rgb(241 240 232 / 4%);
  color: var(--color-text);
  border: 1px solid rgb(241 240 232 / 18%);
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
    color: rgb(241 240 232 / 62%);
    text-shadow: none;
  }

  28% {
    color: var(--color-accent);
    text-shadow: 0 0 18px rgb(239 236 224 / 18%);
  }

  42%,
  100% {
    color: rgb(241 240 232 / 74%);
    text-shadow: none;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 18px;
    border-radius: 8px;
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
