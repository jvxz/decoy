<script lang="ts" setup>
import { email, required, sameAs, withMessage } from '@regle/rules'

import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const { matrixClient, setFormError, clearFormError } = injectAuthLayoutContext()

const form = ref({
  confirmPassword: '',
  email: '',
  password: '',
  username: '',
})

const { r$ } = useRegle(form, {
  confirmPassword: {
    required,
    sameAs: withMessage(
      sameAs(() => form.value.password),
      'Passwords do not match',
    ),
  },
  email: {
    email: withMessage(email, 'Invalid email address'),
    required,
  },
  password: { required },
  username: { required },
})
const { register, login } = useAuth()
const { isPending: isLoggingIn } = login
const { isPending: isRegistering, error: registerError, reset: resetRegisterError } = register

whenever(registerError, err => {
  if (err instanceof EmailInUseError)
    r$.$setExternalErrors({
      email: ['This email is already in use'],
    })

  if (err instanceof EmailRateLimitedError) {
    const message = `Email requests are being rate limited. Please try again in ${isUndefined(err.retryInMs) ? 'a few seconds' : `${Math.floor(err.retryInMs / 1000)} seconds`}`

    setFormError({
      message,
      title: 'Email rate limit exceeded',
    })
  }
})
watch(
  () => r$.email.$value,
  () => {
    if (registerError.value) {
      resetRegisterError()
      r$.$clearExternalErrors()
    }
  },
)

async function handleSubmit() {
  if (r$.$invalid) return

  clearFormError()

  await register.mutateAsync({
    email: r$.email.$value!,
    manualClient: matrixClient.value,
    password: r$.password.$value!,
    username: r$.username.$value!,
  })

  return navigateTo('/app/me/home', { external: true })
}
</script>

<template>
  <form class="contents" @submit.prevent="handleSubmit">
    <FormInput required v-model:model-value="r$.username.$value" label="Username" :error="r$.username.$errors" />
    <FormInput required v-model:model-value="r$.email.$value" label="Email" :error="r$.email.$errors" />
    <FormInput
      type="password"
      required
      v-model:model-value="r$.password.$value"
      label="Password"
      :error="r$.password.$errors"
    />
    <FormInput
      type="password"
      required
      v-model:model-value="r$.confirmPassword.$value"
      label="Confirm password"
      :error="r$.confirmPassword.$errors"
    />

    <UButton
      :is-loading="isRegistering || isLoggingIn"
      @click="handleSubmit"
      :disabled="r$.$invalid"
      size="lg"
      variant="default"
      class="w-full"
    >
      <span>Register</span>
    </UButton>
  </form>
</template>
