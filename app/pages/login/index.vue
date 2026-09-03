<script lang="ts" setup>
import { PageLoginFlowPw, PageLoginFlowSso } from '#components'
import { injectAuthLayoutContext } from '~/layouts/auth.vue'

definePageMeta({
  layout: 'auth',
})

const {
  editableInput: homeserverInput,
  error: contextError,
  registrationDisabled,
  urlParams,
} = injectAuthLayoutContext()

const {
  data: loginFlows,
  dataUpdatedAt,
  isFetching,
  isSuccess: isHomeserverLoginFlowsSuccess,
} = useHomeserverLoginFlows(homeserverInput)

const flows = computed(() =>
  [
    getPwFlow(loginFlows.value?.flows ?? []) && PageLoginFlowPw,
    getSSOFlow(loginFlows.value?.flows ?? []) && PageLoginFlowSso,
  ].filter(c => !!c),
)

watch(dataUpdatedAt, () => (contextError.value = undefined))
</script>

<template>
  <template v-if="isHomeserverLoginFlowsSuccess && !isFetching">
    <template v-for="(flow, i) in flows" :key="i">
      <div v-if="i > 0" class="my-1 flex gap-3 items-center">
        <USeparator class="shrink" />
        <span class="text-xs text-muted-foreground shrink-0">or</span>
        <USeparator class="shrink" />
      </div>

      <component :is="flow" />
    </template>

    <UTooltipRoot :disabled="!registrationDisabled">
      <UTooltipTrigger as-child>
        <p
          :class="
            cn('text-center mt-2 text-base w-fit mx-auto', registrationDisabled && 'decoration-line-through opacity-50')
          "
        >
          Need an account?
          <UButton :disabled="registrationDisabled" variant="link" as-child class="text-base">
            <NuxtLink inherit :to="{ name: 'register', query: { ...urlParams } }">Register</NuxtLink>
          </UButton>
        </p>
      </UTooltipTrigger>

      <UTooltipContent> Registrations are disabled on this homeserver. </UTooltipContent>
    </UTooltipRoot>
  </template>
</template>
