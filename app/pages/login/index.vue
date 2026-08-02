<script lang="ts">
import type { EventHookReturn } from '@vueuse/core'
import type { EditableRootEmits } from 'reka-ui'
import type { ShallowRef } from 'vue'

export const [injectLoginPageEditableStateContext, provideLoginPageEditableStateContext] = createContext<{
  editableInput: Ref<string>
  editableState: Ref<EditableRootEmits['update:state'][number]>
  isPending: Ref<boolean>
  isSSONavigating: Ref<boolean>
  isLoggingIn: Ref<boolean>
  refreshHook: EventHookReturn<void>
  error: ShallowRef<ErrorShape | undefined>
}>('app/pages/login/index.vue')
</script>

<script lang="ts" setup>
const urlParams = useUrlSearchParams('history', {
  initialValue: {
    homeserver: 'matrix.org',
  },
})
const editableInput = toRef(urlParams, 'homeserver')
const editableState = ref<EditableRootEmits['update:state'][number]>('cancel')
const error = shallowRef()
const isLoggingIn = ref(false)
const isPending = ref(false)
const isSSONavigating = ref(false)
const refreshHook = createEventHook()

provideLoginPageEditableStateContext({
  editableInput,
  editableState,
  error,
  isLoggingIn,
  isPending,
  isSSONavigating,
  refreshHook,
})
</script>

<template>
  <div class="p-16 flex flex-col w-full">
    <div class="flex flex-col gap-6 max-w-sm w-full">
      <PageLoginHeading />
      <PageLoginForm />
    </div>
  </div>
</template>
