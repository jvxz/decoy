<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

export interface USkeletonProps {
  delay?: number
  shimmer?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<USkeletonProps>(), {
  delay: 1400,
  shimmer: true,
})

const delegated = reactiveOmit(props, ['class', 'delay', 'shimmer'])
</script>

<template>
  <div v-bind="delegated" :class="cn('rounded p-0 bg-secondary-raised relative overflow-clip', props.class)" aria-busy>
    <div
      v-if="shimmer"
      class="bg-gradient-linear size-full ease from-transparent to-transparent via-foreground/3 bg-gradient-to-r/oklch"
      :style="{
        animation: `skeleton ${delay}ms infinite`,
        willChange: 'transform',
      }"
    />
  </div>
</template>
