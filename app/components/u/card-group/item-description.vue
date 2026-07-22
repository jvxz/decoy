<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardGroupItemDescriptionProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardGroupItemDescriptionProps>()
</script>

<template>
  <UCardDescription v-bind="props" data-slot="card-group-item-description">
    <slot />
  </UCardDescription>
</template>
