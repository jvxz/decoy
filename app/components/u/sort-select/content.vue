<script lang="ts" setup>
import type { SelectContentEmits, SelectContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { useForwardPropsEmits } from 'reka-ui'

import { injectSortSelectContext } from './root.vue'

const props = defineProps<SelectContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<SelectContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)

const { options } = injectSortSelectContext()
</script>

<template>
  <USelectContent v-bind="forwarded" data-slot="sort-select-content">
    <slot>
      <USelectItem v-for="option in options" :key="option" :value="option" data-slot="sort-select-item">
        <USelectItemText data-slot="sort-select-item-text">{{ kebabToSentence(option) }}</USelectItemText>
      </USelectItem>
    </slot>
  </USelectContent>
</template>
