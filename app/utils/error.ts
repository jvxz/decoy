import { MatrixError, TokenRefreshError } from 'matrix-js-sdk'

export enum ErrorCode {
  InvalidUrl = 'INVALID_URL',
  InvalidHomeserver = 'INVALID_HOMESERVER',
}

export interface $ErrorOptions {
  message: string
  code?: ErrorCode | (string & {})
  title: string
}

export class $Error extends Error {
  code?: ErrorCode | (string & {})
  title?: string

  constructor({ code, message, title }: $ErrorOptions) {
    super(message)
    this.code = code
    this.title = title
  }
}

export interface ErrorShape {
  code?: $ErrorOptions['code']
  message: string
  title?: string
  raw?: string
}

export function parseError(error: unknown, opts?: { fallbackMessage?: string }): ErrorShape {
  const fallbackMessage = opts?.fallbackMessage ?? 'Unknown error'

  if (error instanceof $Error)
    return {
      code: error.code,
      message: error.message,
      raw: JSON.stringify(error),
      title: error.title,
    }

  if (error instanceof MatrixError)
    return {
      code: error.errcode,
      message: error.data.error ?? error.message,
      raw: JSON.stringify(error.data),
      title: error.data.errcode,
    }

  if (error instanceof TokenRefreshError)
    return {
      message: error.message,
      raw: JSON.stringify(error),
      title: error.name,
    }

  return {
    message: fallbackMessage,
    raw: JSON.stringify(error),
  }
}
