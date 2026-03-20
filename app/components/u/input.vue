<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  leadingIcon?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
})

const inputClass = computed(() => cn(
  staticStyles.base,
  interactiveStyles.size.default,
  staticStyles.variant.default,
  'flex w-full min-w-0 cursor-text truncate py-1 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:text-foreground placeholder:text-muted-foreground focus-visible:ring-3 text-sm',
  props.class,
))
</script>

<template>
  <input
    v-if="!props.leadingIcon"
    v-model="modelValue"
    data-1p-ignore
    v-bind="$attrs"
    :class="inputClass"
  >
  <div v-else class="relative">
    <Icon :name="props.leadingIcon" class="text-muted-foreground h-1lh left-2 top-1/2 absolute -translate-y-1/2" />
    <input
      v-model="modelValue"
      v-bind="$attrs"
      data-1p-ignore
      class="ps-8"
      :class="[inputClass]"
    >
  </div>
</template>
