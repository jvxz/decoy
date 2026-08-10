<script lang="ts" setup>
import { required } from '@regle/rules'

import { injectDialogUiaContext } from '../../uia.vue'

const { authDict, handleSubmit, isFormValid } = injectDialogUiaContext()
const { client } = useMatrixClient()

const { r$ } = useRegle(
  {
    password: '',
  },
  {
    password: { required },
  },
)

syncRef(toRef(r$, '$ready'), isFormValid, { direction: 'ltr' })
watchEffect(() => {
  authDict.value = {
    identifier: { type: 'm.id.user', user: client.value.getUserId() },
    password: r$.password.$value,
  }
})
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <FormInput
      v-model:model-value="r$.password.$value"
      type="password"
      label="Password"
      required
      :error="r$.password.$errors"
      @keydown.enter="handleSubmit"
    />
  </form>
</template>
