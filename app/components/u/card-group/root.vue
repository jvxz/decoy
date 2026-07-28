<script lang="ts" setup>
import type { UCardProps } from '../card/index.vue'

export interface UCardGroupRootProps extends UCardProps {
  ghost?: boolean
}

const props = withDefaults(defineProps<UCardGroupRootProps>(), {
  ghost: false,
  spacing: 'lg',
})

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <UCard
    v-bind="delegated"
    :data-spacing="spacing"
    :class="cn(ghost && 'p-0 border-0 bg-transparent shadow-none', props.class)"
    data-slot="card-group-root"
  >
    <slot />
  </UCard>
</template>
