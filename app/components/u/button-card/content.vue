<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UButtonCardContentProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UButtonCardContentProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive v-bind="delegated" :class="cn('h-full space-y-2 ', props.class)" data-slot="button-card-content">
    <slot />
  </Primitive>
</template>
