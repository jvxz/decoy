<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardGroupItemFooterProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardGroupItemFooterProps>()
</script>

<template>
  <UCardFooter v-bind="props" data-slot="card-group-item-footer">
    <slot />
  </UCardFooter>
</template>
