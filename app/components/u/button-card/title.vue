<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UButtonCardTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<UButtonCardTitleProps>(), { as: 'p' })

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    v-bind="delegated"
    :class="cn('text-foreground w-fit -mt-0.75', props.class)"
    data-slot="button-card-title"
  >
    <slot />
  </Primitive>
</template>
