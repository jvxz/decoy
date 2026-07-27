<script lang="ts" setup>
import type { UButtonCardIconProps } from '../button-card/icon.vue'

export type UCheckboxCardIconProps = UButtonCardIconProps

const props = defineProps<UCheckboxCardIconProps>()
</script>

<template>
  <UButtonCardIcon v-bind="props" data-slot="checkbox-card-icon">
    <slot />
  </UButtonCardIcon>
</template>
