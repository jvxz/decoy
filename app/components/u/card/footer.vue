<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardFooterProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardFooterProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive v-bind="delegated" :class="cn('flex items-center', props.class)" data-slot="card-footer">
    <slot />
  </Primitive>
</template>
