<template>
  <div class="snapshot-shell">
    <svg class="snapshot-svg" :viewBox="viewBox">
      <GlowDefs />

      <FlowEdge
        v-for="edge in renderableEdges"
        :key="edge.id"
        :edge="edge"
        :source-node="nodeMap[edge.source]"
        :target-node="nodeMap[edge.target]"
        :is-selected="false"
      />

      <FlowNode
        v-for="node in renderableNodes"
        :key="node.id"
        :node="node"
        :is-selected="node.id === activeNodeId"
        :is-linked="node.id === activeNodeId || linkedNodeIds.has(node.id)"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FlowNode from '../editor/edge/FlowNode.vue'
import FlowEdge from '../editor/edge/FlowEdge.vue'
import GlowDefs from '../editor/edge/GlowDefs.vue'

defineOptions({ name: 'ProjectFlowSnapshot' })

const props = defineProps({ project: { type: Object, required: true } })

const activeNodeId = computed(() => {
  const activeStepKey = props.project?.activeStepKey
  const activeStepIndex = (props.project?.steps ?? []).findIndex((step) => step.key === activeStepKey)
  if (activeStepIndex >= 0) {
    return props.project?.diagram?.nodes?.[activeStepIndex]?.id ?? null
  }
  const doingIndex = (props.project?.steps ?? []).findIndex((step) => step.status === 'doing')
  return doingIndex >= 0 ? props.project?.diagram?.nodes?.[doingIndex]?.id ?? null : null
})

const nodeMap = computed(() => {
  const map = {}
  for (const node of props.project?.diagram?.nodes ?? []) map[node.id] = node
  return map
})

const linkedNodeIds = computed(() => {
  const activeIndex = (props.project?.steps ?? []).findIndex((step) => step.key === props.project?.activeStepKey)
  return new Set(
    (props.project?.diagram?.nodes ?? [])
      .map((node, index) => (index < activeIndex ? null : node.id))
      .filter(Boolean),
  )
})

const getNodeLayout = (node, index) => ({
  x: node.layout?.x ?? node.x ?? 120 + index * 280,
  y: node.layout?.y ?? node.y ?? 120 + index * 50,
  width: node.layout?.width ?? node.width ?? 220,
  height: node.layout?.height ?? node.height ?? 120,
})

const viewBox = computed(() => {
  const nodes = props.project?.diagram?.nodes ?? []
  if (nodes.length === 0) return '0 0 1600 900'

  const padding = 220
  const bounds = nodes.reduce(
    (result, node, index) => {
      const layout = getNodeLayout(node, index)
      return {
        minX: Math.min(result.minX, layout.x),
        minY: Math.min(result.minY, layout.y),
        maxX: Math.max(result.maxX, layout.x + layout.width),
        maxY: Math.max(result.maxY, layout.y + layout.height),
      }
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )

  const minX = bounds.minX - padding
  const minY = bounds.minY - padding
  const width = Math.max(bounds.maxX - bounds.minX + padding * 2, 900)
  const height = Math.max(bounds.maxY - bounds.minY + padding * 2, 520)
  return `${minX} ${minY} ${width} ${height}`
})

const renderableNodes = computed(() =>
  (props.project?.diagram?.nodes ?? []).map((node, index) => {
    const step = props.project?.steps?.[index]
    const status = step?.status ?? 'pending'
    const isActive = node.id === activeNodeId.value
    const locked = step?.locked ?? index > 0
    const palette = {
      done: { fill: 'rgb(159 179 154 / 24%)', stroke: '#9fb39a' },
      doing: { fill: 'rgb(239 236 224 / 18%)', stroke: '#efece0' },
      pending: { fill: 'rgb(168 163 154 / 8%)', stroke: '#6f685e' },
      blocked: { fill: 'rgb(255 116 116 / 18%)', stroke: '#ff9d9d' },
    }
    const theme = palette[status] ?? palette.pending

    return {
      ...node,
      layout: getNodeLayout(node, index),
      title: node.title ?? step?.label ?? `Node ${index + 1}`,
      subtitle: isActive
        ? 'Current target step'
        : locked && status === 'pending'
          ? 'Locked'
          : step?.description ?? node.subtitle ?? '',
      style: {
        ...(node.style ?? {}),
        fill: locked && status === 'pending' && !isActive ? 'rgb(241 240 232 / 4%)' : theme.fill,
        stroke: isActive ? '#efece0' : theme.stroke,
      },
      ui: {
        ...(node.ui ?? {}),
        active: isActive,
        locked: locked && !isActive,
      },
    }
  }),
)

const renderableEdges = computed(() =>
  (props.project?.diagram?.edges ?? []).map((edge) => {
    const sourceIndex = props.project?.diagram?.nodes?.findIndex((n) => n.id === edge.source) ?? -1
    const sourceStep = props.project?.steps?.[sourceIndex]
    const isUnlocked = sourceStep?.status === 'done' || sourceStep?.status === 'doing'
    return {
      ...edge,
      style: {
        ...(edge.style ?? {}),
        color: isUnlocked ? 'rgb(239 236 224)' : 'rgb(111 104 94)',
        animated: isUnlocked,
      },
    }
  }),
)
</script>

<style scoped>
.snapshot-shell {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(241 240 232 / 10%);
  background:
    radial-gradient(circle, rgb(241 240 232 / 10%) 1px, transparent 1.5px),
    linear-gradient(180deg, rgb(24 14 13 / 94%), rgb(20 12 11 / 96%));
  background-size:
    18px 18px,
    100% 100%;
}

.snapshot-svg {
  width: 100%;
  height: 260px;
  display: block;
  overflow: visible;
}
</style>
