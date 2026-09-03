<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'vue'

import type { ButtonProps } from './button.vue'

export interface UMentionProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
  size?: ButtonProps['size']
  onClick?: ButtonHTMLAttributes['onClick']
}

const props = defineProps<UMentionProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <UButton
    v-bind="delegated"
    :class="
      cn(
        'px-1 py-0 border-none bg-primary/60 opacity-80 px-1 -m-0.25 text-base h-fit rounded text-foreground',
        'active:bg-primary/90',
        'hover:(bg-primary/90 opacity-100)',
        'data-[popover-open]:(bg-primary/90 opacity-100)',
        props.class,
      )
    "
    data-slot="mention"
  >
    <slot />
  </UButton>
</template>
