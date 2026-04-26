<template>
  <div class="snapshot-shell">
    <svg class="snapshot-svg" viewBox="0 0 1600 900">
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
import FlowNode from './FlowNode.vue'
import FlowEdge from './FlowEdge.vue'
import GlowDefs from './GlowDefs.vue'

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

const renderableNodes = computed(() =>
  (props.project?.diagram?.nodes ?? []).map((node, index) => {
    const step = props.project?.steps?.[index]
    const status = step?.status ?? 'pending'
    const isActive = node.id === activeNodeId.value
    const locked = step?.locked ?? index > 0
    const palette = {
      done: { fill: 'rgb(62 208 142 / 26%)', stroke: '#b7ffd4' },
      doing: { fill: 'rgb(88 229 255 / 28%)', stroke: '#ffffff' },
      pending: { fill: 'rgb(148 163 184 / 10%)', stroke: '#475569' },
      blocked: { fill: 'rgb(255 116 116 / 18%)', stroke: '#ff9d9d' },
    }
    const theme = palette[status] ?? palette.pending

    return {
      ...node,
      layout: {
        x: node.layout?.x ?? node.x ?? 120 + index * 280,
        y: node.layout?.y ?? node.y ?? 120 + index * 50,
        width: node.layout?.width ?? node.width ?? 220,
        height: node.layout?.height ?? node.height ?? 120,
      },
      title: node.title ?? step?.label ?? `Node ${index + 1}`,
      subtitle: isActive
        ? 'Current target step'
        : locked && status === 'pending'
          ? 'Locked'
          : step?.description ?? node.subtitle ?? '',
      style: {
        ...(node.style ?? {}),
        fill: locked && status === 'pending' && !isActive ? 'rgb(255 255 255 / 3%)' : theme.fill,
        stroke: isActive ? '#ffffff' : theme.stroke,
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
        color: isUnlocked ? 'rgb(136 245 255)' : 'rgb(71 85 105)',
        animated: isUnlocked,
      },
    }
  }),
)
</script>

<style scoped>
.snapshot-shell {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgb(126 162 255 / 18%);
  background: linear-gradient(180deg, rgb(37 41 52 / 92%), rgb(26 30 40 / 92%));
}

.snapshot-svg {
  width: 100%;
  height: 520px;
  display: block;
}
</style>
