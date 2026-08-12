<script lang="ts">
import { AuthType, MatrixError, SSOAction } from 'matrix-js-sdk'

import { AuthSsoRedirectButton, PageRegisterFlowEmail } from '#components'
import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const flowFormComponentMap: Partial<
  Record<AuthType | (string & {}), { component: Component; props?: Record<string, unknown> }>
> = {
  [AuthType.Email]: { component: PageRegisterFlowEmail },
  [AuthType.Sso]: { component: AuthSsoRedirectButton, props: { action: SSOAction.REGISTER } },
}
</script>

<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
})

const { editableInput: homeserverInput, registrationDisabled, setFormError, urlParams } = injectAuthLayoutContext()

const { data: registrationFlows, error: registrationFlowsError } = useHomeserverRegistration(homeserverInput, false)

const compatibleFlows = computed(() =>
  registrationFlows.value?.flows?.filter(f => f.stages.every(s => MATRIX.AUTH.UIA.SUPPORTED_STAGES.has(s))),
)
const renderableFlows = computed(() =>
  compatibleFlows.value?.map(f => ({
    entry: flowFormComponentMap[f.stages.find(s => s in flowFormComponentMap)!],
    rawStages: f.stages,
  })),
)

whenever(
  () => registrationFlowsError.value instanceof MatrixError,
  () => {
    const { errcode } = registrationFlowsError.value as MatrixError
    if (errcode === MatrixErrorCode.M_UNKNOWN) {
      setFormError({
        message: 'This homeserver returned an error. Try again shortly, or try a different one',
        title: 'Unknown error',
      })
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <template v-if="!registrationDisabled">
    <template v-if="renderableFlows?.length">
      <template v-for="(flow, i) in renderableFlows" :key="i">
        <div v-if="i > 0" class="my-1 flex gap-3 items-center">
          <USeparator class="shrink" />
          <span class="text-xs text-muted-foreground shrink-0">or</span>
          <USeparator class="shrink" />
        </div>

        <component :is="flow.entry!.component" v-bind="flow.entry!.props || {}" :homeserver="homeserverInput" />
      </template>
    </template>
    <p v-else class="text-base text-muted-foreground italic">
      Magi currently does not support the authentication flows available on this homeserver. Feel free to try a
      different one
    </p>

    <p class="text-base mt-2 text-center">
      Have an account?
      <UButton variant="link" as-child class="text-base">
        <NuxtLink :to="{ name: 'login', query: { ...urlParams } }">Login</NuxtLink>
      </UButton>
    </p>
  </template>

  <UAlertRoot v-else variant="danger">
    <UAlertIcon name="tabler:exclamation-circle" class="shrink-0" />

    <UAlertContent>
      <UAlertTitle>Registrations disabled</UAlertTitle>
      <UAlertDescription>
        Registrations are disabled on this homeserver. Login instead, or choose a different one
      </UAlertDescription>

      <UAlertFooter>
        <UButton variant="danger" as-child>
          <NuxtLink :to="{ name: 'login', query: { ...urlParams } }"> Login </NuxtLink>
        </UButton>
      </UAlertFooter>
    </UAlertContent>
  </UAlertRoot>
</template>
