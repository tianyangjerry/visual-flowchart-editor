<template>
  <header class="hero" :class="{ 'is-visible': visible }">
    <p class="hero-kicker">Visual Flowchart Editor</p>
    <h1 class="hero-title" aria-label="Build polished workflow diagrams and approvals in one place.">
      <span
        v-for="(word, wordIndex) in heroTitleWords"
        :key="`${word.text}-${wordIndex}`"
        class="hero-title__word"
      >
        <span
          v-for="char in word.chars"
          :key="char.key"
          class="hero-title__char"
          :style="{ '--i': char.index }"
        >
          {{ char.value }}
        </span>
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
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  heroTitleChars: {
    type: Array,
    default: () => [],
  },
})

const heroTitleWords = computed(() => {
  const words = []
  let currentWord = null

  props.heroTitleChars.forEach((char, index) => {
    if (char === ' ') {
      currentWord = null
      return
    }

    if (!currentWord) {
      currentWord = { text: '', chars: [] }
      words.push(currentWord)
    }

    currentWord.text += char
    currentWord.chars.push({
      value: char,
      index,
      key: `${char}-${index}`,
    })
  })

  return words
})
</script>

<style scoped>
.hero {
  max-width: 1180px;
  margin: 0 auto 52px;
}

.hero {
  position: relative;
  min-height: 58vh;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: 18px;
  overflow: hidden;
  padding: 28px 16px;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  margin: 0;
  color: var(--color-action);
  letter-spacing: 0;
  font-size: 15px;
  text-transform: uppercase;
}

.hero-title {
  margin: 0;
  max-width: 980px;
  font-size: clamp(38px, 6vw, 68px);
  line-height: 1.06;
  letter-spacing: 0;
  animation: fade-rise 700ms ease both;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 0.28em;
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
}

.hero-title__word {
  display: inline-block;
  white-space: nowrap;
}

.hero-title__char {
  display: inline-block;
  color: var(--color-text);
  animation: none;
}

.hero-description {
  margin: 0;
  max-width: 760px;
  color: var(--color-text-muted);
  font-size: clamp(17px, 2vw, 22px);
  line-height: 1.7;
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
  min-height: 48px;
  padding: 0 22px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
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
  background: var(--color-action);
  color: var(--color-panel);
  box-shadow: none;
}

.btn-primary:hover {
  background: var(--color-action-hover);
}

.btn-secondary {
  background: var(--color-panel);
  color: var(--color-text);
  border: 1px solid var(--color-border);
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
    font-size: clamp(36px, 12vw, 56px);
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
