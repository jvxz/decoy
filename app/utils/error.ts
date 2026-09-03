import { MatrixError, TokenRefreshError } from 'matrix-js-sdk'

// https://github.com/cinnyapp/cinny/blob/5e00d517ebd6b77663e41bcbe888b37df6d3b3d9/src/app/cs-errorcode.ts
export enum MatrixErrorCode {
  M_FORBIDDEN = 'M_FORBIDDEN',
  M_UNKNOWN_TOKEN = 'M_UNKNOWN_TOKEN',
  M_MISSING_TOKEN = 'M_MISSING_TOKEN',
  M_BAD_JSON = 'M_BAD_JSON',
  M_NOT_JSON = 'M_NOT_JSON',
  M_NOT_FOUND = 'M_NOT_FOUND',
  M_LIMIT_EXCEEDED = 'M_LIMIT_EXCEEDED',
  M_UNRECOGNIZED = 'M_UNRECOGNIZED',
  M_UNKNOWN = 'M_UNKNOWN',

  M_UNAUTHORIZED = 'M_UNAUTHORIZED',
  M_USER_DEACTIVATED = 'M_USER_DEACTIVATED',
  M_USER_IN_USE = 'M_USER_IN_USE',
  M_INVALID_USERNAME = 'M_INVALID_USERNAME',
  M_WEAK_PASSWORD = 'M_WEAK_PASSWORD',
  M_PASSWORD_TOO_SHORT = 'M_PASSWORD_TOO_SHORT',
  M_ROOM_IN_USE = 'M_ROOM_IN_USE',
  M_INVALID_ROOM_STATE = 'M_INVALID_ROOM_STATE',
  M_THREEPID_IN_USE = 'M_THREEPID_IN_USE',
  M_THREEPID_NOT_FOUND = 'M_THREEPID_NOT_FOUND',
  M_THREEPID_AUTH_FAILED = 'M_THREEPID_AUTH_FAILED',
  M_THREEPID_DENIED = 'M_THREEPID_DENIED',
  M_SERVER_NOT_TRUSTED = 'M_SERVER_NOT_TRUSTED',
  M_UNSUPPORTED_ROOM_VERSION = 'M_UNSUPPORTED_ROOM_VERSION',
  M_INCOMPATIBLE_ROOM_VERSION = 'M_INCOMPATIBLE_ROOM_VERSION',
  M_BAD_STATE = 'M_BAD_STATE',
  M_GUEST_ACCESS_FORBIDDEN = 'M_GUEST_ACCESS_FORBIDDEN',
  M_CAPTCHA_NEEDED = 'M_CAPTCHA_NEEDED',
  M_CAPTCHA_INVALID = 'M_CAPTCHA_INVALID',
  M_MISSING_PARAM = 'M_MISSING_PARAM',
  M_INVALID_PARAM = 'M_INVALID_PARAM',
  M_TOO_LARGE = 'M_TOO_LARGE',
  M_EXCLUSIVE = 'M_EXCLUSIVE',
  M_RESOURCE_LIMIT_EXCEEDED = 'M_RESOURCE_LIMIT_EXCEEDED',
  M_CANNOT_LEAVE_SERVER_NOTICE_ROOM = 'M_CANNOT_LEAVE_SERVER_NOTICE_ROOM',
}

export enum ErrorCode {
  InvalidUrl = 'INVALID_URL',
  InvalidHomeserver = 'INVALID_HOMESERVER',
  Unknown = 'UNKNOWN',
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

// custom errors

export class EmailInUseError extends Error {
  override name = 'EmailInUseError'
}

export class EmailRateLimitedError extends Error {
  retryInMs?: number

  override name = 'EmailRateLimitedError'

  constructor({ retryInMs }: { retryInMs?: number | undefined } = {}) {
    super('Email rate limit exceeded')
    this.retryInMs = retryInMs
  }
}

export class RegistrationDisabledError extends Error {
  override name = 'RegistrationDisabledError'
}

export class UIACancellationError extends Error {
  override name = 'UIACancellationError'
}

export class UIALegacyUnsupportedError extends Error {
  override name = 'UIALegacyUnsupportedError'
}
