<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

import type { FormPrimitiveProps } from '~/components/form/primitive.vue'

export interface SettingsFormPrimitiveProps extends FormPrimitiveProps {
  description?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<SettingsFormPrimitiveProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <FormPrimitive v-bind="delegated" :class="cn('flex gap-2 items-center justify-between space-y-0', props.class)">
    <template #label="{ id }">
      <slot name="label" :id>
        <div class="flex flex-col gap-1">
          <ULabel :for="id" class="text-base font-medium m-0">
            {{ label }}
          </ULabel>
          <p v-if="description" class="text-sm text-muted-foreground">
            {{ description }}
          </p>
        </div>
      </slot>
    </template>
    <slot />
  </FormPrimitive>
</template>
