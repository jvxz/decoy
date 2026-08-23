<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface UBlockquoteProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<UBlockquoteProps>(), {
  as: 'blockquote',
})

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    v-bind="delegated"
    :class="cn('text-muted-foreground text-sm flex items-center gap-2 h-2em', props.class)"
    data-slot="blockquote"
  >
    <span aria-hidden="true" class="bg-border h-full w-px" />

    <span>
      <slot />
    </span>
  </Primitive>
</template>
