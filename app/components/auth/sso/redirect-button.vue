<script lang="ts" setup>
import type { SSOAction } from 'matrix-js-sdk'

import type { ButtonProps } from '~/components/u/button.vue'

export interface AuthSsoRedirectButtonProps extends ButtonProps {
  action: SSOAction
  homeserver: string | undefined
}

const props = withDefaults(defineProps<AuthSsoRedirectButtonProps>(), {
  size: 'lg',
  variant: 'soft',
})

const router = useRouter()
const requestUrl = useRequestURL()
const redirectUrl = computed(() => new URL(router.resolve('/login/sso').href, requestUrl.origin).href)

const resolvedBaseUrl = useResolveHomeserverBaseUrl(toRef(props, 'homeserver'))
const ssoUrl = useSsoUrl(resolvedBaseUrl, redirectUrl, {
  action: () => props.action,
})

const isNavigating = ref(false)

const handleClick = async () => {
  assert(resolvedBaseUrl.value, 'no resolved homeserver base URL when starting SSO')
  try {
    isNavigating.value = true
    await idb.set(SSO_BASE_URL_KEY, resolvedBaseUrl.value)
    return navigateTo(ssoUrl.value, { external: true })
  } catch {
    isNavigating.value = false
  }
}

const delegated = reactiveOmit(props, 'class', 'action', 'homeserver')
</script>

<template>
  <UButton
    v-bind="delegated"
    :disabled="!ssoUrl"
    :is-loading="isNavigating"
    :class="cn('w-full', props.class)"
    data-slot="auth-sso-redirect-button"
    @click="handleClick"
  >
    <span>Continue with SSO</span>
    <Icon name="tabler:key" class="size-4" />
  </UButton>
</template>
