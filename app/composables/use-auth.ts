import type { ICreateClientOpts, LoginResponse, LoginRequest as MatrixLoginRequest } from 'matrix-js-sdk'
import type { MatrixError } from 'matrix-js-sdk'

import { createClient } from 'matrix-js-sdk'

export type AuthPayload = Pick<
  ICreateClientOpts,
  'baseUrl' | 'deviceId' | 'refreshToken' | 'userId' | 'accessToken'
> & { expiresAt?: number }

interface BaseLoginRequest extends MatrixLoginRequest {
  baseUrl: string
}

interface PasswordLoginRequest extends BaseLoginRequest {
  type: 'm.login.password'
  identifier: MatrixLoginRequest['identifier']
  token?: never
  password: string
}

interface TokenLoginRequest extends BaseLoginRequest {
  type: 'm.login.token'
  identifier?: never
  token: string
  password?: never
}

export type LoginRequest = Prettify<PasswordLoginRequest | TokenLoginRequest>

export function useAuth() {
  const { client } = useMatrixClient()

  const login = useAsyncState(
    async (req: LoginRequest) => {
      const homeserver =
        req.type === 'm.login.password'
          ? await resolveHomeserverBaseUrl(normalizeHomeserverUrl(req.baseUrl))
          : req.baseUrl

      const tempClient = createClient({
        baseUrl: homeserver,
      })

      const [loginError, loginRes] = await attemptAsync<LoginResponse, MatrixError>(() =>
        tempClient.loginRequest({
          ...req,
          refresh_token: true,
        }),
      )

      if (loginError) {
        return loginError
      }

      const authPayload: AuthPayload = {
        accessToken: loginRes.access_token,
        baseUrl: homeserver,
        deviceId: loginRes.device_id,
        expiresAt: loginRes.expires_in_ms ? Date.now() + loginRes.expires_in_ms : undefined,
        refreshToken: loginRes.refresh_token,
        userId: loginRes.user_id,
      }
      await idb.setItem<AuthPayload>('auth', authPayload)

      return authPayload
    },
    undefined,
    { immediate: false, throwError: true },
  )

  const logout = useAsyncState(async () => logoutClient(client.value), undefined, { immediate: false })

  return {
    login,
    logout,
  }
}
