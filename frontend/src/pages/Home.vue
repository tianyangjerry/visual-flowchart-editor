<template>
  <main class="home-page">
    <HomeHero :visible="visible.hero" :hero-title-chars="heroTitleChars" />

    <section ref="carouselRef" class="section-shell" :class="{ 'is-visible': visible.carousel }">
      <HomeShowcaseCarousel />
    </section>

    <HomeFlowSection ref="flowRef" :visible="visible.flow" />

    <FeedbackStackCard />

    <HomeFooter />
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import HomeHero from '../components/home/HomeHero.vue'
import HomeFlowSection from '../components/home/HomeFlowSection.vue'
import HomeShowcaseCarousel from '../components/home/HomeShowcaseCarousel.vue'
import FeedbackStackCard from '../components/home/FeedbackStackCard.vue'
import HomeFooter from '../components/home/HomeFooter.vue'

const carouselRef = ref(null)
const flowRef = ref(null)

const visible = reactive({
  hero: false,
  carousel: false,
  flow: false,
})

const heroTitleChars = [...'Build polished workflow diagrams and approvals in one place.']
let observer = null

function observeSection(key, el) {
  if (!el || !observer) return
  observer.observe(el)
  el.dataset.revealKey = key
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const key = entry.target.dataset.revealKey
        if (key && key in visible) visible[key] = true
      })
    },
    { threshold: 0.18 },
  )

  observeSection('carousel', carouselRef.value)
  observeSection('flow', flowRef.value?.sectionRef?.value ?? flowRef.value?.sectionRef)

  visible.hero = true
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

defineOptions({
  name: 'HomePage',
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 32px clamp(16px, 4vw, 56px) 72px;
  background:
    radial-gradient(circle at top left, rgb(126 162 255 / 18%), transparent 34%),
    radial-gradient(circle at 70% 10%, rgb(56 189 248 / 10%), transparent 26%),
    linear-gradient(180deg, #181a20 0%, #12151b 100%);
  color: var(--color-text);
}

.section-shell {
  margin-bottom: 26px;
}

.section-shell {
  max-width: 1180px;
  margin: 0 auto 26px;
}

.feedback-card__back-header h3 {
  margin: 6px 0 0;
  font-size: clamp(20px, 2.4vw, 28px);
}

.feedback-form label {
  display: grid;
  gap: 8px;
  color: #e7eefc;
  font-size: 14px;
}

.feedback-form input,
.feedback-form textarea {
  width: 100%;
  border: 1px solid rgb(126 162 255 / 14%);
  border-radius: 16px;
  background: rgb(255 255 255 / 3%);
  color: #f4f8ff;
  padding: 14px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
}

.feedback-form input:focus,
.feedback-form textarea:focus {
  border-color: rgb(126 162 255 / 30%);
  box-shadow: 0 0 0 3px rgb(88 229 255 / 10%);
}

@media (max-width: 640px) {
  .home-page {
    padding: 16px 14px 56px;
  }

  .section-shell {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>
