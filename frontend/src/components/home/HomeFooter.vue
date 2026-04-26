<template>
  <footer class="home-footer">
    <div class="footer-grid">
      <section class="footer-column">
        <h4>Product</h4>
        <nav aria-label="Product links">
          <RouterLink to="/editor">Flowchart Editor</RouterLink>
          <RouterLink to="/my-center">My Center</RouterLink>
        </nav>
      </section>

      <section class="footer-column">
        <h4>Project</h4>
        <div class="footer-contact">
          <span>Version: v1.0.0</span>
          <span>Status: Active Development</span>
          <span>Last updated: Apr 2026</span>
        </div>
      </section>

      <section class="footer-column">
        <h4>Contact</h4>
        <div class="footer-contact">
          <a href="mailto:support@visualflowchart.app">support@visualflowchart.app</a>
          <a href="mailto:partnerships@visualflowchart.app">partnerships@visualflowchart.app</a>
          <span>Mon–Fri · 9:00 AM – 6:00 PM (UTC+8)</span>
        </div>
      </section>
    </div>

    <p class="footer-copy">© {{ currentYear }} Visual Flowchart Editor. All rights reserved.</p>
    <p class="footer-credit">Team: Make Oulu Great Again · Incubated at University of Oulu</p>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
const currentYear = new Date().getFullYear()

defineOptions({ name: 'HomeFooter' })
</script>

<style scoped>
.home-footer {
  width: min(100%, 1560px);
  margin: 18px auto 0;
  padding: 28px clamp(16px, 3vw, 36px) 0;
  border-top: 1px solid rgb(126 162 255 / 16%);
  display: grid;
  gap: 18px;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.2fr);
  gap: clamp(24px, 4vw, 72px);
}

.footer-column h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #f3f6ff;
}

.footer-column nav,
.footer-contact {
  display: grid;
  gap: 10px;
}

.footer-column a,
.footer-contact a {
  color: #cfe0ff;
  text-decoration: none;
  font-size: 15px;
}

.footer-column a:hover,
.footer-contact a:hover {
  text-decoration: underline;
}

.footer-contact span,
.footer-copy,
.footer-credit {
  color: var(--color-text-muted);
  font-size: 14px;
}

.footer-copy {
  margin: 4px 0 0;
}

.footer-credit {
  margin: 2px 0 0;
}

@media (max-width: 960px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
