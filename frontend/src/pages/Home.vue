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
    linear-gradient(122deg, #140f0e 0%, #1a1110 52%, #3a1712 100%),
    linear-gradient(180deg, #15100f 0%, #100c0b 100%);
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
  color: var(--color-text);
  font-size: 14px;
}

.feedback-form input,
.feedback-form textarea {
  width: 100%;
  border: 1px solid rgb(241 240 232 / 12%);
  border-radius: 8px;
  background: rgb(241 240 232 / 4%);
  color: var(--color-text);
  padding: 14px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
}

.feedback-form input:focus,
.feedback-form textarea:focus {
  border-color: rgb(239 236 224 / 30%);
  box-shadow: 0 0 0 3px rgb(239 236 224 / 8%);
}

@media (max-width: 640px) {
  .home-page {
    padding: 16px 14px 56px;
  }

  .section-shell {
    padding: 18px;
    border-radius: 8px;
  }
}
</style>
