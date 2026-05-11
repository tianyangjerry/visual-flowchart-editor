<template>
  <n-modal
    :show="show"
    preset="card"
    :mask-closable="!loading"
    :closable="!loading"
    style="width: min(460px, calc(100vw - 32px))"
    @update:show="handleShowChange"
  >
    <template #header>
      <div class="confirm-dialog__title">{{ title }}</div>
    </template>

    <p class="confirm-dialog__message">{{ message }}</p>

    <div class="confirm-dialog__actions">
      <n-space justify="end" :size="10">
        <n-button :disabled="loading" tertiary @click="handleCancel">
          {{ cancelText }}
        </n-button>
        <n-button type="error" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </n-button>
      </n-space>
    </div>
  </n-modal>
</template>

<script setup>
import { NButton, NModal, NSpace } from 'naive-ui'

defineOptions({
  name: 'ConfirmDialog',
})
defineProps( {
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to continue?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loading: {
    type: Boolean,
    default: false,
  },
} )
const emit = defineEmits(['update:show', 'confirm', 'cancel'])

function handleShowChange(nextValue) {
  emit('update:show', nextValue)
  if (!nextValue) {
    emit('cancel')
  }
}

function handleCancel() {
  emit('update:show', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.confirm-dialog__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.confirm-dialog__message {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.confirm-dialog__actions {
  margin-top: 16px;
}
</style>
