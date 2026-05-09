<template>
  <g
    class="flow-node"
    :class="{
      'is-selected': isSelected,
      'is-linked': isLinked,
      'is-connect-valid': props.connectState === 'valid',
      'is-connect-invalid': props.connectState === 'invalid',
    }"
    :style="nodeStyleVars"
    :transform="`translate(${layoutData.x}, ${layoutData.y})`"
    @pointerdown.stop="handlePointerDown"
    @click.stop="handleClick"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <path
      v-if="isDecisionNode"
      class="flow-node__body"
      :d="decisionPath"
      :fill="styleData.fill || 'var(--color-node-fill)'"
      :stroke="
        isSelected ? 'var(--node-theme-glow)' : styleData.stroke || 'var(--node-theme-border)'
      "
      :stroke-width="isSelected ? 2.8 : 1.8"
      :filter="isSelected ? 'url(#node-glow)' : null"
    />
    <rect
      v-else
      class="flow-node__body"
      :width="layoutData.width"
      :height="layoutData.height"
      :rx="RADIUS_NODE"
      :ry="RADIUS_NODE"
      :fill="styleData.fill || 'var(--color-node-fill)'"
      :stroke="
        isSelected ? 'var(--node-theme-glow)' : styleData.stroke || 'var(--node-theme-border)'
      "
      :stroke-width="isSelected ? 2.8 : 1.8"
      :filter="isSelected ? 'url(#node-glow)' : null"
    />

    <path
      v-if="isDecisionNode"
      class="flow-node__overlay"
      :d="decisionPath"
      fill="url(#node-fill-gradient)"
      pointer-events="none"
    />
    <rect
      v-else
      class="flow-node__overlay"
      :width="layoutData.width"
      :height="layoutData.height"
      :rx="RADIUS_NODE"
      :ry="RADIUS_NODE"
      fill="url(#node-fill-gradient)"
      pointer-events="none"
    />

    <rect
      v-if="!isDecisionNode"
      class="flow-node__header"
      :width="layoutData.width"
      :height="headerHeight"
      :rx="RADIUS_NODE"
      :ry="RADIUS_NODE"
      fill="var(--node-header-start)"
      pointer-events="none"
    />

    <g
      v-if="isDecisionNode"
      class="flow-node__decision-content"
      :transform="`translate(${layoutData.width / 2}, ${layoutData.height / 2})`"
    >
      <g class="flow-node__badges" transform="translate(-58, -20)">
        <rect class="flow-node__badge" x="0" y="0" width="54" height="20" rx="10" />
        <text class="flow-node__badge-text" x="27" y="13" text-anchor="middle">{{
          triggerModeLabel
        }}</text>
        <rect
          class="flow-node__badge flow-node__badge--status"
          x="60"
          y="0"
          width="54"
          height="20"
          rx="10"
        />
        <text class="flow-node__badge-text" x="87" y="13" text-anchor="middle">{{
          statusLabel
        }}</text>
      </g>

      <text class="flow-node__title flow-node__title--centered" y="6" text-anchor="middle">{{
        node.title
      }}</text>
      <text class="flow-node__subtitle flow-node__subtitle--centered" y="26" text-anchor="middle">{{
        requiredFieldsText
      }}</text>
    </g>

    <g v-else>
      <g class="flow-node__badges" :transform="`translate(12, 14)`">
        <rect class="flow-node__badge" x="0" y="0" width="54" height="20" rx="10" />
        <text class="flow-node__badge-text" x="27" y="13" text-anchor="middle">{{
          triggerModeLabel
        }}</text>
        <rect
          class="flow-node__badge flow-node__badge--status"
          x="60"
          y="0"
          width="54"
          height="20"
          rx="10"
        />
        <text class="flow-node__badge-text" x="87" y="13" text-anchor="middle">{{
          statusLabel
        }}</text>
      </g>

      <text class="flow-node__title" :x="12" :y="48" text-anchor="start">{{ node.title }}</text>
      <text class="flow-node__subtitle" :x="12" :y="66" text-anchor="start">{{
        requiredFieldsText
      }}</text>
    </g>
  </g>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'FlowNode',
})

const RADIUS_NODE = 10

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isLinked: {
    type: Boolean,
    default: false,
  },
  connectState: {
    type: String,
    default: 'none',
  },
  connectHint: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['node-clicked', 'node-drag-start', 'node-hover'])

const NODE_THEME_MAP = {
  process: {
    border: '#c8bdab',
    glow: '#efece0',
    headerStart: 'rgb(239 236 224 / 16%)',
  },
  task: {
    border: '#c8bdab',
    glow: '#efece0',
    headerStart: 'rgb(239 236 224 / 16%)',
  },
  startEnd: {
    border: '#9fb39a',
    glow: '#b8c8b3',
    headerStart: 'rgb(159 179 154 / 18%)',
  },
  terminal: {
    border: '#9fb39a',
    glow: '#b8c8b3',
    headerStart: 'rgb(159 179 154 / 18%)',
  },
  data: {
    border: '#b9aa90',
    glow: '#d8cfbd',
    headerStart: 'rgb(185 170 144 / 18%)',
  },
  decision: {
    border: '#c36855',
    glow: '#da8a73',
    headerStart: 'rgb(195 104 85 / 18%)',
  },
}

const layoutData = computed(() => {
  const layout = props.node.layout ?? {}
  return {
    x: layout.x ?? props.node.x ?? 0,
    y: layout.y ?? props.node.y ?? 0,
    width: layout.width ?? props.node.width ?? 220,
    height: layout.height ?? props.node.height ?? 120,
  }
})

const styleData = computed(() => {
  return (
    props.node.style ?? {
      variant: props.node.type ?? 'process',
      fill: props.node.fill,
      stroke: props.node.stroke,
    }
  )
})

const nodeTheme = computed(() => NODE_THEME_MAP[styleData.value.variant] ?? NODE_THEME_MAP.process)
const nodeStyleVars = computed(() => ({
  '--node-theme-border': nodeTheme.value.border,
  '--node-theme-glow': nodeTheme.value.glow,
  '--node-header-start': nodeTheme.value.headerStart,
}))

const isDecisionNode = computed(() => props.node.type === 'decision')
const triggerModeLabel = computed(() =>
  (props.node.workflow?.triggerMode ?? 'manual').toUpperCase(),
)
const statusLabel = computed(() =>
  (props.node.workflow?.status ?? props.node.status ?? 'active').toUpperCase(),
)
const requiredFieldsCount = computed(() =>
  Array.isArray(props.node.workflow?.requiredFields)
    ? props.node.workflow.requiredFields.length
    : 0,
)
const requiredFieldsText = computed(() => `${requiredFieldsCount.value} required fields`)

const headerHeight = computed(() => Math.min(30, Math.max(24, layoutData.value.height * 0.22)))

const decisionPath = computed(() => {
  const { width, height } = layoutData.value
  const halfW = width / 2
  const halfH = height / 2
  return `M ${halfW} 0 L ${width} ${halfH} L ${halfW} ${height} L 0 ${halfH} Z`
})

function handleClick() {
  emit('node-clicked', props.node.id)
}

function handlePointerDown(event) {
  emit('node-drag-start', {
    event,
    nodeId: props.node.id,
  })
}

function handlePointerEnter() {
  emit('node-hover', {
    nodeId: props.node.id,
    phase: 'enter',
  })
}

function handlePointerLeave() {
  emit('node-hover', {
    nodeId: props.node.id,
    phase: 'leave',
  })
}
</script>

<style scoped>
.flow-node {
  cursor: grab;
}

.flow-node:active {
  cursor: grabbing;
}

.flow-node__body {
  transition: stroke-width 0.14s ease;
}

.flow-node__overlay {
  opacity: 0.94;
}

.flow-node__header {
  opacity: 0.82;
}

.flow-node__badge {
  fill: rgb(20 12 11 / 78%);
  stroke: rgb(241 240 232 / 16%);
  stroke-width: 1;
}

.flow-node__badge--status {
  fill: rgb(159 179 154 / 18%);
}

.flow-node__badge-text {
  fill: rgb(241 240 232 / 96%);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
  user-select: none;
  pointer-events: none;
}

.flow-node__title {
  fill: var(--color-node-label);
  font-size: 13px;
  font-weight: 700;
  dominant-baseline: middle;
  user-select: none;
  pointer-events: none;
}

.flow-node__title--centered {
  font-size: 16px;
}

.flow-node__subtitle {
  fill: var(--color-node-subtitle);
  font-size: 11px;
  dominant-baseline: middle;
  user-select: none;
  pointer-events: none;
}

.flow-node__subtitle--centered {
  font-size: 12px;
}

.flow-node__metric {
  fill: var(--color-node-label);
  font-size: 10.5px;
  dominant-baseline: middle;
  user-select: none;
  pointer-events: none;
}

.is-selected .flow-node__body {
  animation: node-breathing-glow 1.8s ease-in-out infinite;
}

.is-linked .flow-node__body {
  stroke: color-mix(in srgb, var(--node-theme-glow) 62%, white);
  stroke-width: 2.4;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--node-theme-glow) 58%, transparent));
}

.is-connect-valid .flow-node__body {
  stroke: #9fb39a;
  stroke-width: 2.8;
  filter: drop-shadow(0 0 10px rgb(159 179 154 / 42%));
}

.is-connect-invalid .flow-node__body {
  stroke: #fb7185;
  stroke-width: 2.8;
  filter: drop-shadow(0 0 10px rgb(251 113 133 / 45%));
}

@keyframes node-breathing-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--node-theme-glow) 52%, transparent));
  }
  50% {
    filter: drop-shadow(0 0 14px color-mix(in srgb, var(--node-theme-glow) 75%, transparent));
  }
}
</style>
