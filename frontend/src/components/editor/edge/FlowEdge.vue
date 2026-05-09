<template>
  <g class="flow-edge" :class="{ 'is-selected': isSelected }" @click.stop="handleClick">
    <path
      class="flow-edge__halo"
      :d="pathValue"
      fill="none"
      :stroke="edgeColor"
      :stroke-width="edgeWidth + 5"
    />

    <path
      class="flow-edge__line"
      :d="pathValue"
      fill="none"
      :stroke="edgeColor"
      :stroke-width="isSelected ? edgeWidth + 1.5 : edgeWidth"
      :marker-start="markerStart"
      :marker-end="markerEnd"
      :filter="isSelected ? 'url(#edge-glow)' : null"
    />

    <path
      v-if="edge.style?.animated"
      class="flow-edge__flow"
      :d="pathValue"
      fill="none"
      stroke="url(#edge-gradient)"
      :stroke-width="Math.max(1, (edge.style?.width ?? 7) - 0.4)"
      stroke-linecap="round"
    />

    <path class="flow-edge__hit" :d="pathValue" fill="none" stroke="transparent" stroke-width="16" @click.stop="handleClick" />

    <g class="flow-edge__label" :transform="`translate(${labelPosition.x}, ${labelPosition.y})`" @click.stop="handleClick">
      <rect class="flow-edge__label-bg" x="-22" y="-11" width="44" height="22" rx="11" ry="11" />
      <text class="flow-edge__label-text" x="0" y="4" text-anchor="middle">{{ labelText }}</text>
    </g>
  </g>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'FlowEdge',
})

const props = defineProps({
  edge: {
    type: Object,
    required: true,
  },
  sourceNode: {
    type: Object,
    required: true,
  },
  targetNode: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edge-clicked'])

const edgeWidth = computed(() => Number(props.edge.style?.width ?? 7))
const edgeColor = computed(() => props.edge.style?.color ?? 'var(--color-edge)')
const edgeDirection = computed(() => props.edge.style?.direction ?? 'forward')
const labelText = computed(() => props.edge.label || 'next')

const markerStart = computed(() => {
  if (edgeDirection.value === 'both') {
    return 'url(#arrow-head-start)'
  }
  return null
})

const markerEnd = computed(() => {
  if (edgeDirection.value === 'none') {
    return null
  }
  return 'url(#arrow-head)'
})

const curveMeta = computed(() => {
  const sourceLayout = props.sourceNode.layout ?? {
    x: props.sourceNode.x ?? 0,
    y: props.sourceNode.y ?? 0,
    width: props.sourceNode.width ?? 0,
    height: props.sourceNode.height ?? 0,
  }
  const targetLayout = props.targetNode.layout ?? {
    x: props.targetNode.x ?? 0,
    y: props.targetNode.y ?? 0,
    width: props.targetNode.width ?? 0,
    height: props.targetNode.height ?? 0,
  }

  const sourceCenterY = sourceLayout.y + sourceLayout.height / 2
  const targetCenterY = targetLayout.y + targetLayout.height / 2

  const sourceRightX = sourceLayout.x + sourceLayout.width
  const sourceLeftX = sourceLayout.x
  const targetLeftX = targetLayout.x
  const targetRightX = targetLayout.x + targetLayout.width

  const isForward = targetLeftX >= sourceRightX
  const startX = isForward ? sourceRightX : sourceLeftX
  const endX = isForward ? targetLeftX : targetRightX

  const distance = Math.max(60, Math.abs(endX - startX) * 0.35)
  const control1X = isForward ? startX + distance : startX - distance
  const control2X = isForward ? endX - distance : endX + distance

  return {
    path: `M ${startX} ${sourceCenterY} C ${control1X} ${sourceCenterY}, ${control2X} ${targetCenterY}, ${endX} ${targetCenterY}`,
    labelX: startX * 0.125 + control1X * 0.375 + control2X * 0.375 + endX * 0.125,
    labelY: sourceCenterY * 0.125 + sourceCenterY * 0.375 + targetCenterY * 0.375 + targetCenterY * 0.125,
  }
})

const pathValue = computed(() => curveMeta.value.path)
const labelPosition = computed(() => ({
  x: curveMeta.value.labelX,
  y: curveMeta.value.labelY,
}))

function handleClick() {
  emit('edge-clicked', props.edge.id)
}
</script>

<style scoped>
.flow-edge {
  cursor: pointer;
}

.flow-edge__halo {
  opacity: 0.16;
  pointer-events: none;
}

.flow-edge__line {
  transition:
    stroke-width 0.14s ease,
    opacity 0.14s ease;
  opacity: 0.95;
}

.flow-edge__flow {
  opacity: 0.9;
  stroke-dasharray: 1 14;
  animation: edge-flow 1.9s linear infinite;
  pointer-events: none;
}

.flow-edge__line:hover {
  opacity: 1;
}

.is-selected .flow-edge__halo {
  opacity: 0.32;
  animation: edge-breathing 1.6s ease-in-out infinite;
}

.is-selected .flow-edge__line {
  animation: edge-breathing 1.6s ease-in-out infinite;
}

.flow-edge__label {
  pointer-events: none;
}

.flow-edge__label-bg {
  fill: rgb(20 12 11 / 88%);
  stroke: rgb(241 240 232 / 18%);
  stroke-width: 1;
}

.flow-edge__label-text {
  fill: var(--color-accent);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
}

@keyframes edge-flow {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -90;
  }
}

@keyframes edge-breathing {
  0%,
  100% {
    opacity: 0.78;
  }
  50% {
    opacity: 1;
  }
}
</style>
