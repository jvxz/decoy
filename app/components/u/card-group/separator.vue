<script lang="ts" setup>
import type { USeparatorProps } from '../separator.vue'

export interface UCardGroupSeparatorProps extends USeparatorProps {}

const props = defineProps<UCardGroupSeparatorProps>()
</script>

<template>
  <USeparator v-bind="props" data-slot="card-group-separator">
    <slot />
  </USeparator>
</template>
