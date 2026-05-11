<template>
  <section ref="sectionRef" class="section-shell flow-section" :class="{ 'is-visible': visible }">
    <div class="section-header flow-header">
      <p class="section-eyebrow">Content flow</p>
      <h2>Everything you need to move from idea to approval</h2>
    </div>

    <div
      class="flow-row flow-row--right flow-row--top"
      :class="{ 'is-paused': hoverTrack === 'top' }"
      @mouseenter="hoverTrack = 'top'"
      @mouseleave="hoverTrack = null"
    >
      <div class="flow-row__track">
        <article v-for="card in topFlowCards" :key="`top-${card.id}`" class="flow-card reveal-card">
          <span v-if="card.badge" class="template-chip">{{ card.badge }}</span>
          <div v-if="card.icon" class="card-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.copy }}</p>
        </article>
        <article
          v-for="card in topFlowCards"
          :key="`top-copy-${card.id}`"
          class="flow-card reveal-card"
          aria-hidden="true"
        >
          <span v-if="card.badge" class="template-chip">{{ card.badge }}</span>
          <div v-if="card.icon" class="card-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.copy }}</p>
        </article>
      </div>
    </div>

    <div
      class="flow-row flow-row--left flow-row--bottom"
      :class="{ 'is-paused': hoverTrack === 'bottom' }"
      @mouseenter="hoverTrack = 'bottom'"
      @mouseleave="hoverTrack = null"
    >
      <div class="flow-row__track">
        <article
          v-for="card in bottomFlowCards"
          :key="`bottom-${card.id}`"
          class="flow-card flow-card--quote reveal-card"
        >
          <p class="quote-mark">“</p>
          <p>{{ card.copy }}</p>
          <span>{{ card.author }}</span>
        </article>
        <article
          v-for="card in bottomFlowCards"
          :key="`bottom-copy-${card.id}`"
          class="flow-card flow-card--quote reveal-card"
          aria-hidden="true"
        >
          <p class="quote-mark">“</p>
          <p>{{ card.copy }}</p>
          <span>{{ card.author }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const sectionRef = ref(null)
const hoverTrack = ref(null)

defineExpose({
  sectionRef,
})

const topFlowCards = [
  {
    id: 'features',
    badge: 'Why choose us',
    icon: '01',
    title: 'Structured workflow cards',
    copy: 'Present each module with a clear hierarchy so teams can quickly understand what is active, locked, or approved.',
  },
  {
    id: 'templates',
    badge: 'Popular templates',
    icon: '02',
    title: 'Release approval workflow',
    copy: 'Track planning, review, and sign-off across a lightweight launch process.',
  },
  {
    id: 'product',
    badge: 'Features',
    icon: '03',
    title: 'Portfolio-ready visuals',
    copy: 'Subtle motion, refined spacing, and polished color treatment help the interface feel demo-ready and professional.',
  },
  {
    id: 'education',
    badge: 'Use case',
    icon: '04',
    title: 'Course milestone map',
    copy: 'Guide learners through progressive checkpoints with clear completion signals.',
  },
]

const bottomFlowCards = [
  {
    id: 'quote-1',
    author: 'Chen, Indie Developer',
    copy: 'The page feels much more like a real product now. The workflow structure is easy to understand and the motion stays out of the way.',
  },
  {
    id: 'quote-2',
    author: 'Liu, Instructional Designer',
    copy: 'I can quickly scan the templates and jump into the editor. The landing page finally gives the app a polished, SaaS-style feel.',
  },
  {
    id: 'quote-3',
    author: 'Wang, Growth Operations',
    copy: 'The design hierarchy is clean, and the landing page adds just enough personality without feeling flashy or distracting.',
  },
  {
    id: 'quote-4',
    author: 'Zhang, Product Lead',
    copy: 'The content flow now feels alive and premium, like a modern product homepage rather than a static gallery.',
  },
]
</script>

<style scoped>
.section-shell {
  max-width: 1180px;
  margin: 0 auto 26px;
}

.section-header {
  margin-bottom: 18px;
}

.section-eyebrow {
  margin: 0;
  color: var(--color-action);
  letter-spacing: 0;
  font-size: 15px;
  text-transform: uppercase;
}

.section-header h2 {
  margin: 6px 0 0;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.15;
}

.flow-section {
  padding-top: 8px;
}

.flow-header {
  margin-bottom: 22px;
}

.flow-row {
  position: relative;
  overflow: hidden;
  width: calc(100vw - 16px);
  margin: 18px calc(50% - 50vw + 8px) 0;
  padding-inline: 4px;
  mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
}

.flow-row--top {
  margin-top: 18px;
}

.flow-row--bottom {
  margin-top: 16px;
}

.flow-row__track {
  display: flex;
  width: max-content;
  gap: 18px;
  will-change: transform;
}

.flow-row--right .flow-row__track {
  animation: flow-right 44s linear infinite;
}

.flow-row--left .flow-row__track {
  animation: flow-left 50s linear infinite;
}

.flow-row:hover .flow-row__track,
.flow-row.is-paused .flow-row__track {
  animation-play-state: paused;
}

.flow-row--top .flow-card {
  width: clamp(280px, 36vw, 420px);
  padding: 22px;
  border-radius: 10px;
  background: var(--color-panel);
}

.flow-row--top .flow-card:nth-child(odd) {
  transform: translateY(6px);
}

.flow-row--top .flow-card:nth-child(even) {
  transform: translateY(-8px);
}

.flow-row--top .flow-card:hover {
  transform: translateY(-2px) scale(1.01);
}

.flow-row--bottom .flow-card {
  width: clamp(300px, 38vw, 460px);
  padding: 22px;
  border-radius: 10px;
  background: var(--color-panel);
}

.flow-row--bottom .flow-card:nth-child(odd) {
  transform: translateY(10px);
}

.flow-row--bottom .flow-card:nth-child(even) {
  transform: translateY(-6px);
}

.flow-card {
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 2px rgb(30 30 30 / 4%);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.reveal-card:hover {
  transform: translateY(-2px);
}

.flow-card:hover {
  border-color: var(--color-soft-accent);
  box-shadow: 0 10px 28px rgb(30 30 30 / 7%);
}

.flow-card h3 {
  margin: 14px 0 8px;
  font-size: 20px;
  color: var(--color-text);
}

.flow-card p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.flow-card--quote .quote-mark {
  margin-bottom: 14px;
  font-size: 34px;
  color: var(--color-soft-accent);
}

.flow-card--quote span {
  display: inline-block;
  margin-top: 12px;
  color: var(--color-action);
  font-size: 13px;
}

.is-visible .reveal-card {
  animation: fade-rise 700ms ease both;
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

@keyframes flow-right {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@keyframes flow-left {
  from {
    transform: translateX(-50%);
  }

  to {
    transform: translateX(0);
  }
}

@media (max-width: 960px) {
  .flow-row {
    width: 100%;
    margin: 18px 0 0;
    padding-inline: 0;
  }

  .flow-row--top .flow-card {
    width: clamp(260px, 74vw, 360px);
  }

  .flow-row--bottom .flow-card {
    width: clamp(280px, 78vw, 400px);
  }
}

@media (max-width: 640px) {
  .section-shell {
    padding: 18px;
    border-radius: 8px;
  }

  .flow-row__track {
    gap: 14px;
  }

  .flow-row--top .flow-card,
  .flow-row--bottom .flow-card {
    width: 84vw;
    padding: 18px;
  }
}
</style>
