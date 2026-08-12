import type { ICreateClientOpts, MatrixClient, LoginRequest as MatrixLoginRequest } from 'matrix-js-sdk'

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

  const login = useMutation({
    mutationFn: loginUser,
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
    mutationFn: async ({ email, manualClient, password, username }) => {
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

      await idb.setItem<AuthPayload>('auth', payload)

      return payload
    },
    mutationKey: $mk.register(),
  })

  const logout = useAsyncState(async () => logoutClient(client.value), undefined, { immediate: false })

  return {
    login,
    logout,
    register,
  }
}
