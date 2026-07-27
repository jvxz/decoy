<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UButtonCardDescriptionProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<UButtonCardDescriptionProps>(), { as: 'p' })

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    v-bind="delegated"
    :class="cn('text-muted-foreground text-wrap text-start text-xs font-normal', props.class)"
    data-slot="button-card-description"
  >
    <slot />
  </Primitive>
</template>
