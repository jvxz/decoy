<script lang="ts">
import { AuthType } from 'matrix-js-sdk'

import { PageRegisterFlowEmail } from '#components'
import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const flowFormComponentMap: Partial<Record<AuthType | (string & {}), Component>> = {
  [AuthType.Email]: PageRegisterFlowEmail,
}
</script>

<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
})

const { editableInput: homeserverInput, urlParams, registrationDisabled } = injectAuthLayoutContext()

const { data: registrationFlows } = useHomeserverRegistration(homeserverInput, false)

const compatibleFlows = computed(() =>
  registrationFlows.value?.filter(f => f.stages.every(s => MATRIX.AUTH.UIA.SUPPORTED_STAGES.has(s))),
)
const renderableFlows = computed(() =>
  compatibleFlows.value?.map(f => ({
    rawStages: f.stages,
    renderableStages: f.stages.filter(s => objectKeys(flowFormComponentMap).includes(s)),
  })),
)
</script>

<template>
  <template v-if="!registrationDisabled">
    <template v-for="(flow, key) in renderableFlows" :key>
      <component :is="flowFormComponentMap[flow.renderableStages[0]!]" />
    </template>

    <p class="text-center mt-2 text-base text-muted-foreground">
      Have an account?
      <UButton variant="link" as-child class="text-base text-muted-foreground">
        <NuxtLink :to="{ name: 'login', query: { ...urlParams } }">Login</NuxtLink>
      </UButton>
    </p>
  </template>

  <UAlertRoot v-else variant="danger">
    <UAlertIcon name="tabler:exclamation-circle" class="shrink-0" />

    <UAlertContent>
      <UAlertTitle>Registrations disabled</UAlertTitle>
      <UAlertDescription>
        Registrations are disabled on this homeserver. Login instead, or choose a different one.
      </UAlertDescription>

      <UAlertFooter>
        <UButton variant="danger" as-child>
          <NuxtLink :to="{ name: 'login', query: { ...urlParams } }"> Login </NuxtLink>
        </UButton>
      </UAlertFooter>
    </UAlertContent>
  </UAlertRoot>
</template>
