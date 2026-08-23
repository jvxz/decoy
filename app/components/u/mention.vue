<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'vue'

import type { ButtonProps } from './button.vue'

export interface UMentionProps extends PrimitiveProps {
  type: MentionType
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
        'px-1 py-0 border-none bg-primary/75 opacity-80 px-1 -m-0.25 mx-0.75 text-base h-fit rounded text-foreground',
        'active:bg-primary',
        'hover:(bg-primary opacity-100)',
        'data-[popover-open]:(bg-primary opacity-100)',
        props.class,
      )
    "
    data-slot="mention"
  >
    <slot />
  </UButton>
</template>
