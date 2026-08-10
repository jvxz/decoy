<script lang="ts" setup>
import { required } from '@regle/rules'

import { injectDialogUiaContext } from '../../uia.vue'

const { isFormValid, handleSubmit, authDict } = injectDialogUiaContext()
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
      @keydown.enter="handleSubmit"
      type="password"
      label="Password"
      required
      v-model:model-value="r$.password.$value"
      :error="r$.password.$errors"
    />
  </form>
</template>
