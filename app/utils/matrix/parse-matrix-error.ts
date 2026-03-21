import { MatrixError, TokenRefreshError } from 'matrix-js-sdk'

export function parseMatrixError(error: unknown, opts?: { fallbackMessage?: string }) {
  const fallbackMessage = opts?.fallbackMessage ?? 'Unknown error'

  if (error instanceof $Error)
    return error.message

  if (error instanceof MatrixError)
    return error.data.error ?? fallbackMessage

  if (error instanceof TokenRefreshError)
    return error.message ?? fallbackMessage

  return fallbackMessage
}
