import type { ICreateClientOpts, LoginResponse, MatrixClient, LoginRequest as MatrixLoginRequest } from 'matrix-js-sdk'
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
  const { attemptAction } = useInteractiveAuth()

  const setAuthData = (authPayload: AuthPayload) => idb.setItem<AuthPayload>('auth', authPayload)

  const login = useMutation({
    mutationFn: async (req: LoginRequest) => {
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
      await setAuthData(authPayload)

      return authPayload
    },
    mutationKey: $mk.login(),
  })

  const register = useMutation<
    AuthPayload,
    EmailInUseError | EmailRateLimitedError,
    {
      manualClient?: MatrixClient
      email: string
      password: string
      username: string
    }
  >({
    mutationFn: async ({ email, password, username, manualClient }) => {
      const matrixClient = manualClient ?? client.value

      const { inUse, sid } = await isEmailInUse(matrixClient, email, crypto.randomUUID())
      if (inUse) {
        throw new EmailInUseError()
      }

      const res = await attemptAction(
        auth => matrixClient.registerRequest({ auth: auth ?? undefined, password, username }),
        {
          emailSid: sid,
          inputs: { emailAddress: email },
          matrixClient,
          requestEmailToken: (addr, secret, attempt) => matrixClient.requestRegisterEmailToken(addr, secret, attempt),
        },
      )

      assert(res.access_token, 'Expected access token')

      const payload: AuthPayload = {
        accessToken: res.access_token,
        baseUrl: matrixClient.getHomeserverUrl(),
        deviceId: res.device_id,
        refreshToken: res.refresh_token,
        userId: res.user_id,
      }

      await setAuthData(payload)

      return payload
    },
    mutationKey: $mk.register(),
  })

  const logout = useAsyncState(async () => logoutClient(client.value), undefined, { immediate: false })

  return {
    login,
    logout,
    register,
    setAuthData,
  }
}
