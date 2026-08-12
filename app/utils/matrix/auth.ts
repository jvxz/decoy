import type { LoginResponse, MatrixClient } from 'matrix-js-sdk'

import { createClient, MatrixError } from 'matrix-js-sdk'

const emailsInUseCache = new Set<string>()
/**
 * @throws EmailRateLimitedError, MatrixError, unknown
 */
export async function isEmailInUse(client: MatrixClient, email: string, clientSecret: string) {
  const key = email.trim().toLowerCase()
  if (emailsInUseCache.has(key)) return { inUse: true } as const

  const [err, res] = await attemptAsync(() => client.requestRegisterEmailToken(email, clientSecret, 1))
  if (err) {
    if (err instanceof MatrixError) {
      if (err.errcode === MatrixErrorCode.M_THREEPID_IN_USE) {
        emailsInUseCache.add(key)
        return { inUse: true } as const
      }
      if (err.errcode === MatrixErrorCode.M_LIMIT_EXCEEDED) {
        throw new EmailRateLimitedError({ retryInMs: err.getRetryAfterMs() ?? undefined })
      }
    }
    throw err
  }

  return { inUse: false, sid: res?.sid } as const
}

export async function loginUser(req: LoginRequest) {
  const homeserver =
    req.type === 'm.login.password' ? await resolveHomeserverBaseUrl(normalizeHomeserverUrl(req.baseUrl)) : req.baseUrl

  const tempClient = createClient({
    baseUrl: homeserver,
  })

  const [loginError, loginRes] = await attemptAsync<LoginResponse, Error>(() =>
    tempClient.loginRequest({
      ...req,
      refresh_token: true,
    }),
  )

  if (loginError) {
    return loginError instanceof MatrixError
      ? loginError
      : new MatrixError({
          errcode: MatrixErrorCode.M_UNKNOWN,
          error: loginError.message,
        })
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
}
