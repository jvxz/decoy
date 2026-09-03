<script lang="ts" setup>
import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const { editableInput, editableState, isLoading, refreshHomeserverData } = injectAuthLayoutContext()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-0.5 items-end">
      <h1 class="text-3xl font-semibold mr-2 shrink-0 grow">magi</h1>

      <UButton
        v-if="editableState !== 'edit'"
        :disabled="isLoading"
        size="icon-sm"
        variant="ghost"
        @click="refreshHomeserverData"
      >
        <Icon name="tabler:refresh" />
      </UButton>

      <UEditableRoot
        v-model:model-value="editableInput"
        v-model:state="editableState"
        submit-mode="enter"
        default-value="matrix.org"
        placeholder="matrix.org"
        class="shrink min-w-0 -mb-0.75"
      >
        <UEditableArea class="group">
          <UEditablePreview class="shrink min-w-0 hover:decoration-foreground not-hover:decoration-muted-foreground" />
          <UEditableInput />
        </UEditableArea>
      </UEditableRoot>
    </div>

    <div class="group text-sm text-danger flex gap-2 h-1em items-center">
      <USeparator class="flex-1" />
    </div>
  </div>
</template>
