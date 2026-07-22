<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardTitleProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive v-bind="delegated" :class="cn('text-lg leading-none font-medium', props.class)" data-slot="card-title">
    <slot />
  </Primitive>
</template>
