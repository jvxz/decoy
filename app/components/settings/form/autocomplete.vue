<script lang="ts" setup generic="T extends string[] | undefined">
import type { SettingsFormPrimitiveProps } from './types'

type ValueType = T extends string[] ? T[number] : string

defineProps<
  SettingsFormPrimitiveProps & {
    options: T
    defaultOption?: ValueType
  }
>()

const modelValue = defineModel<ValueType>()
</script>

<template>
  <SettingsFormPrimitive v-bind="$props">
    <USelectRoot v-model:model-value="modelValue">
      <USelectTrigger class="min-w-48">
        <USelectValue>
          <slot name="selectValue" :model-value>{{ modelValue }}</slot>
        </USelectValue>
      </USelectTrigger>
      <USelectContent>
        <USelectItem v-for="option in options" :key="option" :value="option">
          <USelectItemText>
            {{ option }}
          </USelectItemText>
        </USelectItem>
      </USelectContent>
    </USelectRoot>
  </SettingsFormPrimitive>
</template>
