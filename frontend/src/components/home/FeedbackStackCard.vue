<template>
  <section class="feedback-tile">
    <div class="feedback-panel" :class="{ 'is-submitted': submitted }">
      <!-- 左侧内容区 -->
      <div class="feedback-panel__content">
        <p class="feedback-panel__eyebrow">Feedback</p>
        <h2>Have a workflow in mind?</h2>
        <p class="feedback-panel__copy">
          Tell us what you want to build next, and we’ll keep shaping the editor around real project
          needs.
        </p>

        <div class="feedback-panel__meta">
          <span class="meta-pill">Workflow ideas</span>
          <span class="meta-pill">UI suggestions</span>
          <span class="meta-pill">Template requests</span>
        </div>
      </div>

      <!-- 右侧交互区 -->
      <div class="feedback-panel__side" :class="{ 'is-expanded': isExpanded }">
        <div class="feedback-panel__cta" :class="{ 'is-hidden': isExpanded }">
          <button class="primary-btn" type="button" @click="expandPanel">Share feedback</button>
          <p class="feedback-panel__hint">Open a compact feedback form without leaving the page.</p>
        </div>
      </div>

      <div class="feedback-panel__overlay" :class="{ 'is-visible': isExpanded }">
        <button class="feedback-panel__overlay-mask" type="button" aria-label="Close feedback drawer" @click="collapsePanel">
          <span class="sr-only">Close feedback drawer</span>
        </button>
        <div class="feedback-panel__overlay-surface">
          <div class="feedback-panel__form-head">
            <div>
              <p class="form-eyebrow">Suggestion form</p>
              <h3>Send us a quick note</h3>
            </div>

            <button class="ghost-btn" type="button" @click="collapsePanel">Cancel</button>
          </div>

          <form class="feedback-form" @submit.prevent="submitForm">
            <label class="form-field" :class="{ 'is-invalid': errors.email }">
              <span>Email address</span>
              <input
                ref="emailInputRef"
                v-model="email"
                type="email"
                placeholder="name@example.com"
                autocomplete="email"
                :aria-invalid="Boolean(errors.email)"
                aria-describedby="feedback-email-error"
                @input="clearError('email')"
              />
              <small v-if="errors.email" id="feedback-email-error" class="form-error">{{ errors.email }}</small>
            </label>

            <label class="form-field" :class="{ 'is-invalid': errors.message }">
              <span>Your suggestion</span>
              <textarea
                v-model="message"
                rows="4"
                placeholder="Tell us what workflow, review experience, or editor feature you want to see next."
                :aria-invalid="Boolean(errors.message)"
                aria-describedby="feedback-message-error"
                @input="clearError('message')"
              />
              <small v-if="errors.message" id="feedback-message-error" class="form-error">{{ errors.message }}</small>
            </label>

            <div class="form-actions">
              <button class="secondary-btn" type="button" @click="collapsePanel">Back</button>
              <button class="primary-btn" type="submit">Submit feedback</button>
            </div>

            <p v-show="submitted" class="success-text">Thanks — your suggestion has been captured.</p>
          </form>
        </div>
      </div>

      <div class="feedback-panel__glow"></div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const isExpanded = ref(false)
const submitted = ref(false)
const errors = ref({})

const email = ref('')
const message = ref('')
const emailInputRef = ref(null)

async function expandPanel() {
  if (isExpanded.value) return

  isExpanded.value = true
  submitted.value = false
  errors.value = {}
  await nextTick()
  emailInputRef.value?.focus({ preventScroll: true })
}

function collapsePanel() {
  if (!isExpanded.value) return

  isExpanded.value = false
}

function submitForm() {
  errors.value = validateForm()
  if (Object.keys(errors.value).length) {
    submitted.value = false
    return
  }

  submitted.value = true


  console.log('feedback submitted:', {
    email: email.value,
    message: message.value,
  })
}

function validateForm() {
  const nextErrors = {}
  const emailValue = email.value.trim()
  const messageValue = message.value.trim()

  if (!emailValue) {
    nextErrors.email = 'Please enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    nextErrors.email = 'Please enter a valid email address.'
  }

  if (!messageValue) {
    nextErrors.message = 'Please enter your suggestion.'
  } else if (messageValue.length < 10) {
    nextErrors.message = 'Please write at least 10 characters.'
  }

  return nextErrors
}

function clearError(field) {
  if (!errors.value[field]) return
  const { [field]: _removed, ...remainingErrors } = errors.value
  errors.value = remainingErrors
}
</script>

<style scoped>
.feedback-tile {
  width: 100%;
  margin-top: 56px;
}

.feedback-panel {
  --side-width: 280px;
  --drawer-width: min(100%, 480px);
  position: relative;
  width: min(1240px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--side-width);
  gap: 0;
  min-height: 320px;
  border-radius: 8px;
  overflow: visible;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  box-shadow: 0 12px 32px rgb(30 30 30 / 6%);
  transition:
    border-color 240ms ease,
    box-shadow 240ms ease;
}

.feedback-panel.is-expanded {
  border-color: var(--color-soft-accent);
  box-shadow: 0 14px 36px rgb(30 30 30 / 8%);
}

.feedback-panel__content,
.feedback-panel__side {
  position: relative;
  z-index: 1;
}

.feedback-panel__content {
  padding: 42px 42px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feedback-panel__eyebrow,
.form-eyebrow {
  margin: 0 0 12px;
  color: var(--color-action);
  font-size: 13px;
  letter-spacing: 0;
  text-transform: uppercase;
}

.feedback-panel h2 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(34px, 4.4vw, 54px);
  line-height: 1.08;
  letter-spacing: 0;
  max-width: 12ch;
}

.feedback-panel__copy {
  max-width: 700px;
  margin: 18px 0 0;
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1.7;
}

.feedback-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.feedback-panel__side {
  border-left: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  transition:
    background 240ms ease,
    border-color 240ms ease;
  overflow: hidden;
  display: grid;
}

.feedback-panel__side.is-expanded {
  border-left-color: var(--color-soft-accent);
  background: var(--color-bg-elevated);
}

.feedback-panel__cta {
  grid-area: 1 / 1;
  height: 100%;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.feedback-panel__cta.is-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

.feedback-panel__hint {
  margin: 16px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
  max-width: 220px;
}

.feedback-panel__overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--drawer-width);
  max-width: calc(100% - 56px);
  height: 100%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(24px) scale(0.98);
  transform-origin: right center;
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear 220ms;
  z-index: 3;
}

.feedback-panel__overlay.is-visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(0) scale(1);
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s;
}

.feedback-panel__overlay-mask {
  position: absolute;
  inset: 0 26px 0 -34px;
  border: 0;
  padding: 0;
  border-radius: 8px 0 0 8px;
  background: rgb(247 244 237 / 52%);
  opacity: 0;
  transition: opacity 180ms ease;
  pointer-events: auto;
}

.feedback-panel__overlay.is-visible .feedback-panel__overlay-mask {
  opacity: 1;
}

.feedback-panel__overlay-surface {
  position: relative;
  height: 100%;
  margin-left: auto;
  padding: 26px 24px 24px;
  border-left: 1px solid var(--color-border);
  border-radius: 8px 0 0 8px;
  background: var(--color-panel);
  box-shadow: -24px 0 46px rgb(30 30 30 / 9%);
  overflow: hidden;
}

/* 展开态表单 */

.feedback-panel__form-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.feedback-panel__form-head h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 26px;
  line-height: 1.16;
  letter-spacing: 0;
}

.feedback-form {
  display: grid;
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-field span {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
}

.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-panel);
  color: var(--color-text);
  padding: 14px 16px;
  font: inherit;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: rgb(107 107 107 / 58%);
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--color-action);
  box-shadow: 0 0 0 4px rgb(95 111 82 / 12%);
  background: #fffefb;
}

.form-field.is-invalid input,
.form-field.is-invalid textarea {
  border-color: #dc2626;
  background: #fff7f7;
  box-shadow: 0 0 0 4px rgb(220 38 38 / 12%);
}

.form-error {
  color: #dc2626;
  font-size: 13px;
  line-height: 1.4;
}

.form-field textarea {
  resize: vertical;
  min-height: 116px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 2px;
}

.success-text {
  margin: 2px 0 0;
  color: var(--color-action);
  font-size: 14px;
}

/* 按钮 */
.primary-btn,
.secondary-btn,
.ghost-btn {
  border: 0;
  cursor: pointer;
  font: inherit;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 182px;
  height: 56px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--color-action);
  color: var(--color-panel);
  font-size: 16px;
  font-weight: 700;
  box-shadow: none;
}

.primary-btn:hover {
  transform: translateY(-1px);
  background: var(--color-action-hover);
}

.secondary-btn {
  min-width: 110px;
  height: 48px;
  padding: 0 18px;
  border-radius: 8px;
  background: var(--color-bg-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary-btn:hover {
  transform: translateY(-1px);
  background: #ede7dd;
}

.ghost-btn {
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.ghost-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-elevated);
}

/* 背景光 */
.feedback-panel__glow {
  position: absolute;
  right: 160px;
  top: 50%;
  width: 260px;
  height: 260px;
  border-radius: 8px;
  transform: translateY(-50%);
  background: transparent;
  filter: none;
  pointer-events: none;
}

/* 平板 */
@media (max-width: 1080px) {
  .feedback-panel {
    --side-width: 240px;
  }

  .feedback-panel.is-expanded {
    --side-width: 420px;
  }

  .feedback-panel__content {
    padding: 36px 30px 34px;
  }

  .feedback-panel h2 {
    font-size: 48px;
  }

  .feedback-panel__copy {
    font-size: 17px;
  }
}

/* 手机 */
@media (max-width: 820px) {
  .feedback-panel {
    display: block;
    min-height: auto;
  }

  .feedback-panel__content {
    padding: 32px 24px 24px;
  }

  .feedback-panel__side {
    border-left: 0;
    border-top: 1px solid var(--color-border);
  }

  .feedback-panel__cta {
    padding: 22px 24px 24px;
  }

  .feedback-panel__overlay {
    position: static;
    width: 100%;
    max-width: none;
    height: auto;
    transform: translateY(10px) scale(0.98);
  }

  .feedback-panel__overlay.is-visible {
    transform: translateY(0) scale(1);
  }

  .feedback-panel__overlay-mask {
    display: none;
  }

  .feedback-panel__overlay-surface {
    margin-left: 0;
    border-left: 0;
    border-top: 1px solid var(--color-border);
    border-radius: 8px 8px 0 0;
    height: auto;
    min-height: 260px;
  }

  .feedback-panel h2 {
    font-size: 40px;
  }

  .feedback-panel__copy {
    font-size: 16px;
  }

  .feedback-panel__glow {
    width: 180px;
    height: 180px;
    right: 18px;
  }
}

@media (max-width: 560px) {
  .feedback-panel h2 {
    font-size: 34px;
  }

  .feedback-panel__copy {
    font-size: 15px;
  }

  .feedback-panel__meta {
    gap: 8px;
  }

  .meta-pill {
    font-size: 12px;
    height: 32px;
  }

  .primary-btn {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }
}
</style>
