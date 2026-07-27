<script lang="ts" setup>
import type { UButtonCardDescriptionProps } from '../button-card/description.vue'

export interface UCheckboxCardDescriptionProps extends UButtonCardDescriptionProps {}

const props = defineProps<UCheckboxCardDescriptionProps>()
</script>

<template>
  <UButtonCardDescription v-bind="props" data-slot="checkbox-card-description">
    <slot />
  </UButtonCardDescription>
</template>
