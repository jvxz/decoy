<script lang="ts">
import type { AuthDict } from 'matrix-js-sdk'
import type { DialogRootEmits, DialogRootProps } from 'reka-ui'
import type { Component } from 'vue'

import { AuthType } from 'matrix-js-sdk'
import { createContext, useForwardPropsEmits } from 'reka-ui'

import { DialogUiaStagePassword, DialogUiaStageRecaptcha } from '#components'

const flowMap: Partial<
  Record<
    string,
    { name: string; component?: Component; icon: string; title?: string; description?: string; submittable?: boolean }
  >
> = {
  [AuthType.Email]: {
    description: "Check your inbox to verify your account. If you don't see the email, check your spam folder",
    icon: 'tabler:mail',
    name: 'email',
    submittable: false,
    title: 'Email verification pending',
  },
  [AuthType.Password]: {
    component: DialogUiaStagePassword,
    icon: 'tabler:lock-password',
    name: 'password',
  },
  [AuthType.Recaptcha]: {
    component: DialogUiaStageRecaptcha,
    description: 'Solve the reCAPTCHA to verify that you are not a robot',
    icon: 'tabler:text-scan-2',
    name: 'recaptcha',
    submittable: false,
    title: 'Verification required',
  },
}

export interface DialogUiaContext {
  handleSubmit: () => void
  isFormValid: Ref<boolean>
  authDict: Ref<AuthDict | object>
}

export const [injectDialogUiaContext, provideDialogUiaContext] = createContext<DialogUiaContext>('DialogUia')
</script>

<script lang="ts" setup>
export type UiaDialogProps = DialogRootProps
export type UiaDialogEmits = DialogRootEmits

const props = withDefaults(defineProps<UiaDialogProps>(), { modal: true })
const emits = defineEmits<UiaDialogEmits>()

const isFormValid = ref(false)

const { authInstance, authState, dialogOpen, isBusy, submitStage } = useInteractiveAuth()

const authDict = ref<AuthDict>({})

const handleSubmit = () => {
  if (isFormValid.value && !isBusy.value)
    submitStage({
      ...authDict.value,
      session: authInstance.value?.getSessionId(),
      type: authState.value?.nextStage,
    })
}

provideDialogUiaContext({
  authDict,
  handleSubmit,
  isFormValid,
})

const delegated = reactiveOmit(props, ['open'])
const forwarded = useForwardPropsEmits(delegated, emits)

const currentState = computed(() => (authState.value?.nextStage ? flowMap[authState.value.nextStage] : null))
</script>

<template>
  <UAlertDialogRoot v-bind="forwarded" v-model:open="dialogOpen">
    <UAlertDialogContent class="z-uia" data-slot="uia-alert-dialog-content">
      <UAlertDialogHeader>
        <UAlertDialogTitle>
          {{ currentState?.title || 'Additional info required' }}
        </UAlertDialogTitle>
        <UAlertDialogDescription>
          {{ currentState?.description || 'Fill out the form below to proceed' }}
        </UAlertDialogDescription>
      </UAlertDialogHeader>

      <component :is="currentState?.component || 'div'" />

      <UAlertDialogFooter>
        <UAlertDialogCancel> Cancel </UAlertDialogCancel>
        <UButton
          v-if="currentState?.submittable !== false"
          :is-loading="isBusy"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          <span>Continue</span>
        </UButton>
      </UAlertDialogFooter>
    </UAlertDialogContent>
  </UAlertDialogRoot>
</template>
