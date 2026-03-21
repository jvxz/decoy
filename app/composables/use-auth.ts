import type { ICreateClientOpts, LoginRequest as MatrixLoginRequest } from 'matrix-js-sdk'
import { createClient } from 'matrix-js-sdk'

type AuthPayload = Pick<ICreateClientOpts, 'baseUrl' | 'deviceId' | 'refreshToken' | 'userId' | 'accessToken'> & { expiresAt?: number }

interface PasswordLoginRequest extends MatrixLoginRequest {
  type: 'm.login.password'
  identifier: MatrixLoginRequest['identifier']
  token?: never
  password: string
}

interface TokenLoginRequest extends MatrixLoginRequest {
  type: 'm.login.token'
  identifier?: never
  token: string
  password?: never
}

export type LoginRequest = Prettify<PasswordLoginRequest | TokenLoginRequest>

export function useAuth() {
  const { userAgent } = useDevice()
  const idb = useIdb()
  const clientStore = useClientStore()

  async function login(req: LoginRequest) {
    try {
      const homeserver = await resolveBaseUrl(withHttps(req.baseUrl))

      const tempClient = createClient({
        baseUrl: homeserver,
      })

      const deviceId = createDeviceId(userAgent)

      const loginRes = await tempClient.loginRequest({
        ...req,
        device_id: deviceId,
        refresh_token: true,
      })

      const authedClient = createClient({
        accessToken: loginRes.access_token,
        baseUrl: homeserver,
        deviceId: createDeviceId(userAgent),
        refreshToken: loginRes.refresh_token,
        userId: loginRes.user_id,
      })

      clientStore.client = authedClient
      await idb.setItem<AuthPayload>('auth', {
        accessToken: loginRes.access_token,
        baseUrl: homeserver,
        deviceId: createDeviceId(userAgent),
        expiresAt: loginRes.expires_in_ms ? Date.now() + loginRes.expires_in_ms : undefined,
        refreshToken: loginRes.refresh_token,
        userId: loginRes.user_id,
      })

      return authedClient
    }
    catch (error) {
      throw new Error(parseMatrixError(error, { fallbackMessage: 'An unexpected error occurred' }))
    }
  }

  async function loginPersisted() {
    try {
      const auth = await idb.getItem<AuthPayload>('auth')
      if (!auth || !auth.accessToken)
        return

      if (auth.refreshToken && auth.expiresAt && Date.now() >= auth.expiresAt - 60_000) {
        const tempClient = createTempClient(withHttps(auth.baseUrl))
        const refreshed = await tempClient.refreshToken(auth.refreshToken)
        return createClient({
          accessToken: refreshed.access_token,
          baseUrl: auth.baseUrl,
          deviceId: auth.deviceId,
          refreshToken: refreshed.refresh_token,
          userId: auth.userId,
        })
      }

      return createClient(auth)
    }
    catch {}
  }

  async function logout() {
    await idb.removeItem('auth')
    const clientStore = useClientStore()
    clientStore.$reset()

    return reloadNuxtApp({ path: '/login' })
  }

  return {
    login,
    loginPersisted,
    logout,
  }
}
