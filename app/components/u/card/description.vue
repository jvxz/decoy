<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UCardDescriptionProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<UCardDescriptionProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive v-bind="delegated" :class="cn('text-sm text-muted-foreground', props.class)" data-slot="card-description">
    <slot />
  </Primitive>
</template>
