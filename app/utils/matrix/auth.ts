import type { MatrixClient } from 'matrix-js-sdk'

import { MatrixError } from 'matrix-js-sdk'

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
