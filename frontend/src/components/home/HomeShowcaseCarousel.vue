<template>
  <section class="showcase-carousel" aria-label="Homepage showcase carousel">
    <div class="showcase-carousel__header">
      <div class="showcase-carousel__intro">
        <p class="showcase-carousel__eyebrow">Homepage showcase</p>
        <h2>Premium flow storytelling in motion</h2>
        <p class="showcase-carousel__copy">
          A focused three-card presentation that keeps the center feature in command while the side
          cards stay as elegant previews.
        </p>
      </div>

      <div class="showcase-carousel__controls">
        <button
          class="carousel-button"
          type="button"
          aria-label="Previous showcase"
          @click="previous"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button class="carousel-button" type="button" aria-label="Next showcase" @click="next">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>

    <div class="showcase-carousel__stage" aria-live="polite">
      <div class="showcase-carousel__ambient"></div>

      <article
        v-for="slide in visibleSlides"
        :key="slide.id"
        class="showcase-card"
        :class="`showcase-card--${slide.position}`"
        @click="slide.position !== 'center' && goTo(slide.id)"
      >
        <div class="showcase-card__media" :style="{ backgroundImage: `url(${slide.image})` }">
          <span class="showcase-card__tag">
            <span class="showcase-card__tag-dot"></span>
            {{ slide.tag }}
          </span>
        </div>

        <div
          v-if="slide.position === 'center'"
          class="showcase-card__content showcase-card__content--full"
        >
          <div class="showcase-card__meta">
            <span class="showcase-card__kicker">{{ slide.kicker }}</span>
            <span class="showcase-card__index">0{{ slide.number }}</span>
          </div>

          <h3>{{ slide.title }}</h3>
          <p class="showcase-card__description">{{ slide.copy }}</p>

          <button class="showcase-card__cta" type="button">
            <span class="showcase-card__cta-icon">→</span>
            Explore this flow
          </button>
        </div>

        <div v-else class="showcase-card__content showcase-card__content--preview">
          <p class="showcase-card__preview-kicker">{{ slide.previewLabel }}</p>
          <h3>{{ slide.shortTitle }}</h3>
        </div>
      </article>
    </div>

    <div class="showcase-carousel__dots" aria-label="Slide selector">
      <button
        v-for="slide in slides"
        :key="slide.id"
        type="button"
        class="carousel-dot"
        :class="{ 'is-active': slide.id === activeSlide.id }"
        :aria-label="`Show ${slide.title}`"
        @click="goTo(slide.id)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const slides = [
  {
    id: 'workflow',
    number: 1,
    tag: 'Workflow map',
    kicker: 'Course design',
    previewLabel: 'Course design',
    shortTitle: 'Visualize ideas and structure',
    title: 'Visualize ideas and structure with guided steps',
    copy: 'Create structured workflow views that help teams turn rough ideas into clear stages, priorities, and confident delivery.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'learning',
    number: 2,
    tag: 'Learning path',
    kicker: 'Team orchestration',
    previewLabel: 'Team orchestration',
    shortTitle: 'Guide learning from start to mastery',
    title: 'Guide learning from start to mastery',
    copy: 'Create structured learning flows that help students build knowledge step by step with clarity and confidence.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'operations',
    number: 3,
    tag: 'Operations board',
    kicker: 'Team ops',
    previewLabel: 'Team ops',
    shortTitle: 'Align tasks and drive execution',
    title: 'Align tasks and drive execution across teams',
    copy: 'Keep operational checkpoints visible in one polished surface so every review, handoff, and deadline stays easy to follow.',
    image:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
  },
]

const activeIndex = ref(1)
let timer = null

const activeSlide = computed(() => slides[activeIndex.value])

const visibleSlides = computed(() => {
  const total = slides.length
  return [-1, 0, 1].map((offset) => {
    const index = (activeIndex.value + offset + total) % total
    const slide = slides[index]
    return {
      ...slide,
      position: offset === 0 ? 'center' : offset < 0 ? 'left' : 'right',
    }
  })
})

function next() {
  activeIndex.value = (activeIndex.value + 1) % slides.length
}

function previous() {
  activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length
}

function goTo(id) {
  const index = slides.findIndex((slide) => slide.id === id)
  if (index >= 0) activeIndex.value = index
}

onMounted(() => {
  timer = window.setInterval(next, 5200)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.showcase-carousel {
  position: relative;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

.showcase-carousel__header,
.showcase-carousel__stage,
.showcase-carousel__dots {
  position: relative;
  z-index: 1;
}

.showcase-carousel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.showcase-carousel__intro {
  max-width: 760px;
}

.showcase-carousel__eyebrow {
  margin: 0 0 8px;
  color: var(--color-accent-muted);
  font-size: 12px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.showcase-carousel h2 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(34px, 4.8vw, 60px);
  line-height: 1.02;
  letter-spacing: 0;
}

.showcase-carousel__copy {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.showcase-carousel__controls {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.carousel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgb(241 240 232 / 12%);
  border-radius: 999px;
  background: rgb(241 240 232 / 4%);
  color: var(--color-text);
  font-size: 18px;
  cursor: pointer;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.carousel-button:hover {
  transform: translateY(-1px);
  border-color: rgb(239 236 224 / 24%);
  background: rgb(241 240 232 / 7%);
  box-shadow: 0 10px 24px rgb(0 0 0 / 22%);
}

.showcase-carousel__stage {
  position: relative;
  min-height: 760px;
  perspective: 1800px;
}

.showcase-carousel__ambient {
  position: absolute;
  left: 50%;
  bottom: 40px;
  width: min(74vw, 920px);
  height: 120px;
  transform: translateX(-50%);
  background: transparent;
  filter: none;
  opacity: 0;
  pointer-events: none;
}

.showcase-card {
  position: absolute;
  top: 30px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, rgb(36 25 23 / 96%), rgb(20 12 11 / 98%));
  border: 1px solid rgb(241 240 232 / 12%);
  transition:
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 520ms ease,
    box-shadow 520ms ease,
    border-color 520ms ease,
    filter 520ms ease;
  will-change: transform, opacity;
}

.showcase-card--center {
  left: 50%;
  width: min(82vw, 980px);
  transform: translateX(-50%) translateY(0) scale(1);
  z-index: 3;
  opacity: 1;
  box-shadow:
    0 36px 72px rgb(0 0 0 / 36%),
    0 0 0 1px rgb(239 236 224 / 8%);
}

.showcase-card--center::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, rgb(241 231 220 / 22%), rgb(146 58 46 / 18%));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

.showcase-card--left,
.showcase-card--right {
  top: 106px;
  width: 250px;
  z-index: 1;
  opacity: 0.5;
  filter: brightness(0.68);
  box-shadow: 0 18px 34px rgb(0 0 0 / 18%);
  cursor: pointer;
}

.showcase-card--left {
  left: 56px;
  transform: rotateY(16deg) scale(0.9);
}

.showcase-card--right {
  right: 56px;
  transform: rotateY(-16deg) scale(0.9);
}

.showcase-card__media {
  position: relative;
  background-size: cover;
  background-position: center;
}

.showcase-card--center .showcase-card__media {
  height: 360px;
}

.showcase-card--left .showcase-card__media,
.showcase-card--right .showcase-card__media {
  height: 220px;
}

.showcase-card__media::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(20 12 11 / 8%),
    rgb(20 12 11 / 0%) 35%,
    rgb(20 12 11 / 78%) 100%
  );
}

.showcase-card__media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 34%;
  background: linear-gradient(180deg, rgb(20 12 11 / 0%), rgb(20 12 11 / 84%));
}

.showcase-card__tag {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgb(24 23 21 / 86%);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgb(241 240 232 / 10%);
  backdrop-filter: blur(10px);
}

.showcase-card__tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--color-accent), #b17465);
  box-shadow: 0 0 10px rgb(239 236 224 / 18%);
}

.showcase-card__content {
  position: relative;
  z-index: 1;
}

.showcase-card__content--full {
  padding: 26px 30px 30px;
}

.showcase-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.showcase-card__kicker,
.showcase-card__index,
.showcase-card__preview-kicker {
  color: var(--color-accent-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.showcase-card__content--full h3 {
  margin: 0;
  max-width: 18ch;
  color: var(--color-text);
  font-size: clamp(34px, 3vw, 46px);
  line-height: 1.08;
  letter-spacing: 0;
}

.showcase-card__description {
  margin: 16px 0 0;
  max-width: 46ch;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.75;
}

.showcase-card__cta {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.showcase-card__cta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgb(241 240 232 / 14%);
  background: rgb(241 240 232 / 4%);
}

.showcase-card__content--preview {
  padding: 16px 16px 18px;
}

.showcase-card__preview-kicker {
  margin: 0 0 10px;
}

.showcase-card__content--preview h3 {
  margin: 0;
  max-width: 12ch;
  color: rgb(241 240 232 / 82%);
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0;
}

.showcase-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 999px;
  background: rgb(241 240 232 / 18%);
  cursor: pointer;
  transition:
    width 220ms ease,
    background 220ms ease,
    box-shadow 220ms ease,
    opacity 220ms ease;
}

.carousel-dot:hover {
  opacity: 0.85;
}

.carousel-dot.is-active {
  width: 28px;
  background: var(--color-accent);
  box-shadow: 0 0 16px rgb(239 236 224 / 14%);
}

@media (max-width: 1100px) {
  .showcase-card--left {
    left: 24px;
  }

  .showcase-card--right {
    right: 24px;
  }
}

@media (max-width: 960px) {
  .showcase-carousel {
    padding: 0;
  }

  .showcase-carousel__header {
    flex-direction: column;
  }

  .showcase-carousel__stage {
    min-height: 660px;
  }

  .showcase-card--center {
    width: min(92vw, 860px);
  }

  .showcase-card--left,
  .showcase-card--right {
    width: 200px;
    top: 120px;
  }

  .showcase-card--left {
    left: -18px;
  }

  .showcase-card--right {
    right: -18px;
  }
}

@media (max-width: 720px) {
  .showcase-carousel h2 {
    font-size: 34px;
  }

  .showcase-carousel__copy {
    font-size: 15px;
  }

  .showcase-carousel__stage {
    min-height: 520px;
  }

  .showcase-card--left,
  .showcase-card--right {
    display: none;
  }

  .showcase-card--center {
    top: 18px;
    width: 100%;
  }

  .showcase-card--center .showcase-card__media {
    height: 250px;
  }

  .showcase-card__content--full {
    padding: 18px;
  }

  .showcase-card__content--full h3 {
    font-size: 28px;
  }

  .showcase-card__description {
    font-size: 15px;
  }
}
</style>
