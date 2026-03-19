<script lang="ts" setup>
defineProps<{
  label: string
  class?: string
  required?: boolean
  error?: string
}>()

const id = useId()
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
      <p
        v-if="error"
        :title="error"
        class="text-xs text-danger text-end max-w-2/3 truncate"
      >
        {{ error }}
      </p>
    </div>
    <slot :id />
    <div v-if="$slots.footer" class="text-xs text-muted-foreground text-end">
      <slot name="footer" />
    </div>
  </div>
</template>
