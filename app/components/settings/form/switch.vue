<script lang="ts" setup>
import type { SettingsFormPrimitiveProps } from './primitive.vue'

defineProps<SettingsFormPrimitiveProps>()

const modelValue = defineModel<boolean>()
</script>

<template>
  <FormPrimitive v-bind="$props" class="flex gap-2 items-center justify-between space-y-0">
    <template #label="{ id }">
      <div class="flex flex-col gap-1">
        <ULabel :for="id" class="text-base font-medium m-0">
          {{ label }}
        </ULabel>
        <p v-if="description" class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>
    </template>
    <USwitch v-model="modelValue" />
  </FormPrimitive>
</template>
