<template>
  <section class="faq-accordion" aria-labelledby="faq-accordion-title">
    <div class="faq-accordion__header">
      <p class="faq-accordion__eyebrow">Workflow guide</p>
      <h2 id="faq-accordion-title">Frequently asked questions</h2>
    </div>

    <div id="homepageFaqAccordion" class="accordion faq-accordion__list">
      <div v-for="item in faqItems" :key="item.id" class="accordion-item faq-accordion__item">
        <h3 class="accordion-header faq-accordion__item-title">
          <button
            class="accordion-button faq-accordion__button"
            :class="{ collapsed: activeItem !== item.id }"
            type="button"
            :aria-expanded="activeItem === item.id"
            :aria-controls="`${item.id}-panel`"
            @click="toggleItem(item.id)"
          >
            {{ item.question }}
          </button>
        </h3>

        <div
          :id="`${item.id}-panel`"
          class="accordion-collapse collapse faq-accordion__collapse"
          :class="{ show: activeItem === item.id }"
        >
          <div class="accordion-body faq-accordion__body">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const faqItems = [
  {
    id: 'faq-build',
    question: 'What can I build with this editor?',
    answer:
      'You can map workflow steps, connect approvals, define required fields, and keep project progress visible from one canvas.',
  },
  {
    id: 'faq-save',
    question: 'How do saved workflows behave?',
    answer:
      'Saved workflows keep their nodes, connections, labels, and runtime state so you can return to a project without rebuilding the diagram.',
  },
  {
    id: 'faq-approval',
    question: 'Where do approvals fit in?',
    answer:
      'Approval steps can be represented as workflow nodes with required fields, status, and routing rules for the next step.',
  },
]

const activeItem = ref(faqItems[0].id)

function toggleItem(id) {
  activeItem.value = activeItem.value === id ? null : id
}
</script>

<style scoped>
.faq-accordion {
  width: min(1180px, 100%);
  margin: 56px auto 0;
  display: grid;
  grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.22fr);
  gap: 34px;
  align-items: start;
}

.faq-accordion__header {
  padding-top: 8px;
}

.faq-accordion__eyebrow {
  margin: 0 0 10px;
  color: var(--color-action);
  font-size: 13px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.faq-accordion h2 {
  margin: 0;
  max-width: 10ch;
  color: var(--color-text);
  font-size: clamp(32px, 4.4vw, 52px);
  line-height: 1.08;
  letter-spacing: 0;
}

.faq-accordion__list {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-panel);
  box-shadow: 0 12px 32px rgb(30 30 30 / 5%);
}

.faq-accordion__item {
  border: 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.faq-accordion__item:last-child {
  border-bottom: 0;
}

.faq-accordion__item-title {
  margin: 0;
}

.faq-accordion__button {
  width: 100%;
  min-height: 66px;
  padding: 18px 22px;
  border: 0;
  background: var(--color-panel);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  text-align: left;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.faq-accordion__button::after {
  content: '+';
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-action);
  background: var(--color-bg-elevated);
  font-size: 18px;
  line-height: 1;
}

.faq-accordion__button:not(.collapsed)::after {
  content: '-';
}

.faq-accordion__button:hover,
.faq-accordion__button:not(.collapsed) {
  background: var(--color-bg-elevated);
}

.faq-accordion__button:focus-visible {
  outline: 3px solid rgb(95 111 82 / 20%);
  outline-offset: -3px;
}

.faq-accordion__collapse {
  display: none;
}

.faq-accordion__collapse.show {
  display: block;
}

.faq-accordion__body {
  padding: 0 22px 22px;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.7;
  background: var(--color-bg-elevated);
}

@media (max-width: 820px) {
  .faq-accordion {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .faq-accordion h2 {
    max-width: none;
  }
}
</style>
