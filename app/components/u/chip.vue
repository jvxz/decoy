<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export type UChipProps = PrimitiveProps & {
  show?: boolean
  text?: string
  class?: HTMLAttributes['class']
  ui?: DefineClasses<'root' | 'base'>
  variant?: 'notification' | 'success' | 'warn' | 'danger'
  size?: 'lg' | 'default' | 'sm'
}

const props = withDefaults(defineProps<UChipProps>(), {
  show: true,
  size: 'default',
  variant: 'notification',
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-danger'
    case 'notification':
      return 'bg-primary'
    case 'warn':
      return 'bg-warn'
    case 'success':
      return 'bg-success'

    default:
      return 'bg-primary'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'default':
      return '-top-0.5 -right-0.5 size-2 ring-1'
    case 'lg':
      return '-top-1 -right-1 size-3 ring-1.5'
    case 'sm':
      return '-top-0 -right-0 size-1 ring-1'
  }
})
</script>

<template>
  <Primitive :class="cn('relative inline-flex items-center justify-center shrink-0', ui?.root)" data-slot="chip-root">
    <Slot v-bind="{ ...$attrs }">
      <slot />
    </Slot>

    <span
      v-if="show"
      data-slot="base"
      :class="cn('absolute ring-background rounded-full', variantClass, sizeClass, ui?.base, props.class)"
    >
      <slot name="content">
        {{ props.text }}
      </slot>
    </span>
  </Primitive>
</template>
