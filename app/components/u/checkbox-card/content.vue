<script lang="ts" setup>
import type { UButtonCardContentProps } from '../button-card/content.vue'

export interface UCheckboxCardContentProps extends UButtonCardContentProps {}

const props = defineProps<UCheckboxCardContentProps>()
</script>

<template>
  <UButtonCardContent v-bind="props" data-slot="checkbox-card-content">
    <slot />
  </UButtonCardContent>
</template>
