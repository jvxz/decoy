<script lang="ts" setup>
import { Slot } from 'reka-ui'

export interface ButtonProps {
  asChild?: boolean
  disabled?: MaybeRefOrGetter<boolean>
  size?: 'default' | 'icon' | 'lg' | 'sm'
  variant?: 'default' | 'danger' | 'ghost' | 'link' | 'outline' | 'soft'
  class?: string
  isLoading?: MaybeRefOrGetter<boolean>
}

const props = defineProps<ButtonProps>()

const loading = computed(() => toValue(props.isLoading))
</script>

<template>
  <Slot
    v-if="asChild"
    :disabled="toValue(disabled) || loading"
    :class="cn(
      buttonVariants({ variant, size }),
      props.class,
      loading && 'pointer-events-none',
      toValue(disabled) && 'pointer-events-none',
    )"
    :aria-busy="loading || undefined"
  >
    <slot />
  </Slot>
  <button
    v-else
    :disabled="toValue(disabled) || loading"
    :class="cn(
      buttonVariants({ variant, size }),
      props.class,
      toValue(disabled) && 'pointer-events-none',
    )"
    :aria-busy="loading || undefined"
  >
    <LazyUSpinner
      v-if="loading"
      :invert="true"
      class="shrink-0 size-4.5"
    />
    <span v-else class="contents"><slot /></span>
  </button>
</template>
