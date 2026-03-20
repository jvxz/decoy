<script lang="ts">
export interface FormPrimitiveProps {
  label: string
  class?: string
  required?: boolean
  error?: string | string[] | undefined
  isLoading?: boolean
}
</script>

<script lang="ts" setup>
const props = defineProps<FormPrimitiveProps>()

const id = useId()
const errorMessage = computed(() => {
  if (Array.isArray(props.error))
    return props.error[0]

  return props.error
})
</script>

<template>
  <div v-bind="$attrs" :class="cn('space-y-1.5', $props.class)">
    <div class="flex w-full items-center justify-between">
      <ULabel
        :for="id"
        class="text-sm font-medium gap-1"
      >
        {{ label }}
        <span v-if="required" class="text-danger">*</span>
      </ULabel>
      <USpinner
        v-if="isLoading"
        class="shrink-0 size-4.5"
      />
      <p
        v-else-if="errorMessage"
        :title="errorMessage"
        class="text-xs text-danger text-end max-w-2/3 truncate"
      >
        {{ errorMessage }}
      </p>
    </div>
    <Slot :id :data-error="errorMessage ? '' : undefined">
      <slot />
    </Slot>
    <div v-if="$slots.footer" class="text-xs text-muted-foreground text-end">
      <slot name="footer" />
    </div>
  </div>
</template>
