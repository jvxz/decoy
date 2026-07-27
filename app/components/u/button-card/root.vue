<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

import type { ButtonProps } from '../button.vue'

export interface UButtonCardRootProps extends Omit<ButtonProps, 'size' | 'variant'> {
  class?: HTMLAttributes['class']
  variant?: ButtonCardVariants['variant']
  size?: ButtonCardVariants['size']
}

const props = withDefaults(defineProps<UButtonCardRootProps>(), {
  as: 'button',
})

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    v-bind="delegated"
    :class="cn(buttonCardVariants({ variant, size }), props.class)"
    data-slot="button-card-root"
  >
    <slot />
  </Primitive>
</template>
