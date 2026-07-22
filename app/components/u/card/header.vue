<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardHeaderProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardHeaderProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive v-bind="delegated" :class="cn('flex flex-col gap-1.5', props.class)" data-slot="card-header">
    <slot />
  </Primitive>
</template>
