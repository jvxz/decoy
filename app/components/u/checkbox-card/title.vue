<script lang="ts" setup>
import type { UButtonCardTitleProps } from '../button-card/title.vue'

export interface UCheckboxCardTitleProps extends UButtonCardTitleProps {}

const props = defineProps<UCheckboxCardTitleProps>()
</script>

<template>
  <UButtonCardTitle v-bind="props" data-slot="checkbox-card-title">
    <slot />
  </UButtonCardTitle>
</template>
