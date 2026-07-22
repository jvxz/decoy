<script lang="ts" setup>
import type { UCardHeaderProps } from '../card/header.vue'

export interface UCardGroupItemHeaderProps extends UCardHeaderProps {}

const props = defineProps<UCardGroupItemHeaderProps>()
</script>

<template>
  <UCardHeader v-bind="props" data-slot="card-group-item-header">
    <slot />
  </UCardHeader>
</template>
