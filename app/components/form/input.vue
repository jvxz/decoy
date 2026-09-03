<script lang="ts" setup>
import type { InputTypeHTMLAttribute } from 'vue'

import { useForwardExpose } from 'reka-ui'

import { UInput, UTextarea } from '#components'

import type { UInputProps } from '../u/input.vue'
import type { FormPrimitiveProps } from './primitive.vue'

export interface FormInputProps extends FormPrimitiveProps, UInputProps {
  ui?: DefineClasses<'container' | 'input'>
  type?: InputTypeHTMLAttribute
  placeholder?: string
  textarea?: boolean
}

const props = defineProps<FormInputProps>()
const modelValue = defineModel<string | number>('modelValue')

const hasError = computed(() => (props.error && Array.isArray(props.error) ? props.error.length > 0 : !!props.error))
const delegated = reactiveOmit(props, ['placeholder', 'modelValue'])

const { forwardRef } = useForwardExpose()
</script>

<template>
  <FormPrimitive v-bind="delegated" :class="$props.ui?.container">
    <component
      :is="textarea ? UTextarea : UInput"
      :ref="forwardRef"
      v-model="modelValue"
      :disabled
      :disable-pw
      :placeholder
      :type="$props.type"
      :class="cn(hasError && 'border-danger ring-danger', $props.ui?.input)"
    />
  </FormPrimitive>
</template>
