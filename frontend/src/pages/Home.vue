<template>
  <main class="home-page">
    <nav class="navbar navbar-expand-md home-navbar sticky-top" aria-label="Main navigation">
      <RouterLink class="navbar-brand home-navbar__brand" to="/">
        <span class="home-navbar__mark">V</span>
        <span>Visual Diagram Editor</span>
      </RouterLink>

      <button
        class="navbar-toggler home-navbar__toggle"
        type="button"
        :aria-expanded="isNavbarOpen"
        aria-controls="homeNavbarMenu"
        aria-label="Toggle navigation"
        @click="isNavbarOpen = !isNavbarOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="homeNavbarMenu" class="collapse navbar-collapse home-navbar__menu" :class="{ show: isNavbarOpen }">
        <div class="navbar-nav ms-auto home-navbar__links">
          <a class="nav-link" href="#homepage-showcase" @click="closeNavbar">Showcase</a>
          <a class="nav-link" href="#homepage-flow" @click="closeNavbar">Flow</a>
          <a class="nav-link" href="#homepage-faq" @click="closeNavbar">FAQ</a>
          <RouterLink class="nav-link" to="/editor" @click="closeNavbar">Editor</RouterLink>
          <RouterLink class="nav-link" to="/my-center" @click="closeNavbar">My Center</RouterLink>
        </div>
      </div>
    </nav>

    <HomeHero :visible="visible.hero" :hero-title-chars="heroTitleChars" />

    <section id="homepage-showcase" ref="carouselRef" class="section-shell" :class="{ 'is-visible': visible.carousel }">
      <HomeShowcaseCarousel />
    </section>

    <HomeFlowSection id="homepage-flow" ref="flowRef" :visible="visible.flow" />

    <HomeFaqAccordion id="homepage-faq" />

    <FeedbackStackCard />

    <HomeFooter />
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HomeHero from '../components/home/HomeHero.vue'
import HomeFlowSection from '../components/home/HomeFlowSection.vue'
import HomeShowcaseCarousel from '../components/home/HomeShowcaseCarousel.vue'
import HomeFaqAccordion from '../components/home/HomeFaqAccordion.vue'
import FeedbackStackCard from '../components/home/FeedbackStackCard.vue'
import HomeFooter from '../components/home/HomeFooter.vue'

const carouselRef = ref(null)
const flowRef = ref(null)
const isNavbarOpen = ref(false)

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

function closeNavbar() {
  isNavbarOpen.value = false
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
  padding: 0 clamp(16px, 4vw, 56px) 72px;
  background: var(--color-bg);
  color: var(--color-text);
}

.home-navbar {
  top: 0;
  z-index: 20;
  width: min(1180px, 100%);
  margin: 0 auto 32px;
  padding: 14px 0;
  background: rgb(255 253 248 / 92%);
  backdrop-filter: blur(14px);
}

.home-navbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 800;
}

.home-navbar__mark {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--color-action);
  color: var(--color-panel);
  font-size: 16px;
}

.home-navbar__toggle {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-elevated);
  box-shadow: none;
}

.home-navbar__toggle:focus {
  box-shadow: 0 0 0 3px rgb(95 111 82 / 12%);
}

.home-navbar__links {
  gap: 4px;
  align-items: center;
}

.home-navbar__links .nav-link {
  border-radius: 8px;
  color: var(--color-text-muted);
  font-weight: 700;
  padding: 8px 12px;
}

.home-navbar__links .nav-link:hover,
.home-navbar__links .nav-link:focus-visible {
  background: var(--color-action-soft);
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
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-panel);
  color: var(--color-text);
  padding: 14px 16px;
  font: inherit;
  outline: none;
  resize: vertical;
}

.feedback-form input:focus,
.feedback-form textarea:focus {
  border-color: var(--color-action);
  box-shadow: 0 0 0 3px rgb(95 111 82 / 12%);
}

@media (max-width: 767px) {
  .home-navbar {
    margin-bottom: 24px;
  }

  .home-navbar__menu {
    margin-top: 12px;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-panel);
    box-shadow: 0 12px 30px rgb(30 30 30 / 8%);
  }

  .home-navbar__links {
    align-items: stretch;
  }
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
