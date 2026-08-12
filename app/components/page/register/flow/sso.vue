<script lang="ts" setup>
import type { MatrixClient } from 'matrix-js-sdk'

import { AuthType, MatrixError, SSOAction } from 'matrix-js-sdk'

import type { AuthPayload } from '~/composables/use-auth'

import { injectAuthLayoutContext } from '~/layouts/auth.vue'

const {
  clearFormError,
  editableInput: homeserverUrl,
  isLoggingIn,
  isSSONavigating,
  matrixClient,
  setFormError,
} = injectAuthLayoutContext()

const { data: registrationData } = useHomeserverRegistration(homeserverUrl, false)

const isFallbackFlow = computed(() => isString(registrationData.value?.session))

const router = useRouter()
const requestUrl = useRequestURL()
const redirectUrl = computed(() => new URL(router.resolve('/login/sso').href, requestUrl.origin).href)
const resolvedHomeserverBaseUrl = useResolveHomeserverBaseUrl(homeserverUrl)

const ssoRegisterUrl = useSsoUrl(resolvedHomeserverBaseUrl, redirectUrl, {
  action: SSOAction.REGISTER,
})

const isRegistering = ref(false)

async function startUIASession(client: MatrixClient) {
  const [err] = await attemptAsync(() => client.registerRequest({}))
  if (!(err instanceof MatrixError)) throw err ?? new Error('Expected a UIA challenge from /register')
  if (err.httpStatus !== 401) throw err

  assert(isString(err.data?.session), 'homeserver returned a UIA challenge with no session id')
  return err.data.session
}

function waitForAuthDone(popup: Window, homeserverBaseUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const expectedOrigin = new URL(homeserverBaseUrl).origin

    const closePoll = setInterval(() => {
      if (!popup.closed) return
      cleanup()
      reject(new UIACancellationError())
    }, 500)

    function cleanup() {
      window.removeEventListener('message', onMessage)
      clearInterval(closePoll)
      popup.close()
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== expectedOrigin || event.data !== 'authDone') return
      cleanup()
      resolve()
    }

    window.addEventListener('message', onMessage)
  })
}

async function handleFallbackFlow() {
  const popup = window.open('', '_blank')
  if (!popup) {
    setFormError({ message: 'Allow popups for this site to continue with SSO.', title: 'Popup blocked' })
    return
  }

  clearFormError()
  isRegistering.value = true

  const client = matrixClient.value

  try {
    const session = await startUIASession(client)
    popup.location.href = client.getFallbackAuthUrl(AuthType.Sso, session)

    await waitForAuthDone(popup, client.getHomeserverUrl())

    const [err, res] = await attemptAsync<Awaited<ReturnType<typeof client.registerRequest>>, MatrixError>(() =>
      client.registerRequest({ auth: { session } }),
    )

    if (err instanceof MatrixError && err.httpStatus === 401)
      throw new Error('This homeserver requires further registration steps that are not supported yet.')
    if (err) throw err

    assert(res.access_token, 'Expected an access token after completing the SSO registration stage')

    await idb.setItem<AuthPayload>('auth', {
      accessToken: res.access_token,
      baseUrl: client.getHomeserverUrl(),
      deviceId: res.device_id,
      refreshToken: res.refresh_token,
      userId: res.user_id,
    })

    return navigateTo('/app/me/home', { external: true })
  } catch (err) {
    popup.close()
    if (!(err instanceof UIACancellationError)) setFormError(err as Error)
  } finally {
    isRegistering.value = false
  }
}

async function handleRedirectFlow() {
  assert(resolvedHomeserverBaseUrl.value, 'no resolved homeserver base URL when attempting to register via SSO')

  try {
    isSSONavigating.value = true
    await idb.set(SSO_BASE_URL_KEY, resolvedHomeserverBaseUrl.value)
    return navigateTo(ssoRegisterUrl.value, { external: true })
  } catch {
    isSSONavigating.value = false
  }
}

const isDisabled = computed(() => isLoggingIn.value || (!isFallbackFlow.value && !ssoRegisterUrl.value))

const handleClick = () => {
  if (isDisabled.value || isRegistering.value || isSSONavigating.value) return
  return isFallbackFlow.value ? handleFallbackFlow() : handleRedirectFlow()
}
</script>

<template>
  <UButton
    :disabled="isDisabled"
    :is-loading="isRegistering || isSSONavigating"
    variant="soft"
    size="lg"
    class="w-full"
    @click="handleClick"
  >
    <span>Continue with SSO</span>
    <Icon name="tabler:key" class="size-4" />
  </UButton>
</template>
