<script lang="ts" setup>
import type { UCardProps } from '../card/index.vue'

export interface UCardGroupRootProps extends UCardProps {}

const props = withDefaults(defineProps<UCardGroupRootProps>(), {
  spacing: 'lg',
})
</script>

<template>
  <UCard v-bind="props" :data-spacing="spacing" data-slot="card-group-root">
    <slot />
  </UCard>
</template>
