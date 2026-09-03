<script lang="ts" setup>
import { AuthType } from 'matrix-js-sdk'

import { injectDialogUiaContext } from '~/components/dialog/uia.vue'

const { authDict, handleSubmit, isFormValid } = injectDialogUiaContext()
const { authInstance, authState } = useInteractiveAuth()

const siteKey = computed(() => authInstance.value?.getStageParams(AuthType.Recaptcha)?.public_key as string | undefined)

const el = useTemplateRef('captcha')

const { onLoaded } = useScript<{ grecaptcha: ReCaptchaV2.ReCaptcha }>(
  { src: 'https://www.google.com/recaptcha/api.js?render=explicit' },
  { use: () => ({ grecaptcha: window.grecaptcha }) },
)

onLoaded(({ grecaptcha }) => {
  grecaptcha.ready(() => {
    if (!el.value) return
    grecaptcha.render(el.value, {
      callback: (response: string) => {
        if (authState.value?.nextStage !== AuthType.Recaptcha) return
        authDict.value = { response }
        isFormValid.value = true
        handleSubmit()
      },
      'expired-callback': () => {
        isFormValid.value = false
      },
      sitekey: siteKey.value,
    })
  })
})
</script>

<template>
  <div ref="captcha" class="min-h-[72px]" />
</template>
