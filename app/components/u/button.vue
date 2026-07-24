<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'vue'

export interface ButtonProps extends PrimitiveProps {
  disabled?: MaybeRefOrGetter<boolean>
  size?: ButtonVariants['size']
  variant?: ButtonVariants['variant']
  class?: HTMLAttributes['class']
  isLoading?: MaybeRefOrGetter<boolean>
  onClick?: ButtonHTMLAttributes['onClick']
}

withDefaults(defineProps<ButtonProps>(), { as: 'button' })
</script>

<template>
  <Primitive
    v-bind="$props"
    :disabled="disabled || isLoading"
    :data-variant="variant"
    :class="
      cn(
        buttonVariants({ variant, size }),
        $props.class,
        toValue(disabled) && 'pointer-events-none',
        isLoading && 'grid *:col-start-1 *:row-start-1 *:not-first:opacity-0',
      )
    "
    :aria-busy="isLoading || undefined"
  >
    <LazyUSpinner v-if="isLoading" :invert="true" class="mx-auto shrink-0 size-2/3" />
    <slot />
  </Primitive>
</template>
