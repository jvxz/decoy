<script lang="ts" setup>
import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const { editableInput: homeserverUrl, isLoggingIn, isSSONavigating } = injectAuthLayoutContext()

const router = useRouter()
const requestUrl = useRequestURL()
const redirectUrl = computed(() => new URL(router.resolve('/login/sso').href, requestUrl.origin).href)
const resolvedHomeserverBaseUrl = useResolveHomeserverBaseUrl(homeserverUrl)

const ssoLoginUrl = useSsoUrl(homeserverUrl, redirectUrl)

const handleClick = async () => {
  if (isLoggingIn.value) return

  assert(resolvedHomeserverBaseUrl.value, 'no resolved homeserver base URL when attempting to login via SSO')
  try {
    isSSONavigating.value = true
    await idb.set(SSO_BASE_URL_KEY, resolvedHomeserverBaseUrl.value)
    return navigateTo(ssoLoginUrl.value, { external: true })
  } catch {
    isSSONavigating.value = false
  }
}
</script>

<template>
  <UButton
    :disabled="isLoggingIn"
    :is-loading="isSSONavigating"
    variant="soft"
    size="lg"
    class="w-full"
    @click="handleClick"
  >
    <span>Continue with SSO</span>
    <Icon name="tabler:key" class="size-4" />
  </UButton>
</template>
