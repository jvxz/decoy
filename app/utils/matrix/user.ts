import type { RoomMember, User } from 'matrix-js-sdk'

import { assert, merge } from 'es-toolkit'

import { AVATAR_IMAGE_SIZE_VALUES } from '#shared/utils/constants'

import type { MxcToHttpsOptions } from './mxc-to-https'
import type { AvatarImageSize, MaybeUserOrId } from './types'

import { mxcToHttps } from './mxc-to-https'

// adapted from https://github.com/cinnyapp/cinny/blob/098684973ebb28592158efa43e79741ab27afab9/src/app/utils/matrix.ts#L26
export const USER_ID_REG = /^([@$+#])([^\s:]*):(\S+)$/

export function getDisplayNameFallback(maybeUserOrId: MaybeUserOrId | undefined) {
  if (!maybeUserOrId) return 'Unknown user'

  const userId = resolveUserId(maybeUserOrId)

  const match = userId.match(USER_ID_REG)
  assert(match, `invalid user ID when getting display name fallback: ${userId}`)
  return match[2] || match[3]!
}

export type ResolveAvatarUrlOpts = Partial<
  { baseUrl?: string; animated?: boolean; size?: AvatarImageSize } & MxcToHttpsOptions
>
export function resolveAvatarUrl(avatarUrl: string | undefined, opts?: ResolveAvatarUrlOpts) {
  if (!avatarUrl) return undefined

  const size = opts?.size ? AVATAR_IMAGE_SIZE_VALUES[opts.size] : AVATAR_IMAGE_SIZE_VALUES.medium

  return mxcToHttps(
    avatarUrl,
    merge(
      {
        allowDirectLinks: false,
        allowRedirects: true,
        animated: opts?.animated ?? true,
        baseUrl: opts?.baseUrl,
        useAuthentication: true,
        ...(opts?.size !== 'full'
          ? {
              height: size,
              resizeMethod: 'crop',
              width: size,
            }
          : undefined),
      },
      (opts ||= {}),
    ),
  )
}

export function resolveUserId(maybeUserOrId: MaybeUserOrId) {
  if (typeof maybeUserOrId === 'string') return maybeUserOrId

  return maybeUserOrId.userId
}

export function resolveUserName(user: User | RoomMember | string | undefined) {
  if (isString(user)) return getDisplayNameFallback(user)

  if (user?.rawDisplayName) return user.rawDisplayName

  return getDisplayNameFallback(user?.userId)
}

export function parseUserId(userId: string | undefined) {
  if (!userId) {
    return {
      homeserver: 'Unknown homeserver',
      name: 'Unknown name',
    }
  }

  const match = userId.match(USER_ID_REG)
  assert(match, `failed to parse matrix user id: ${userId}`)

  const homeserver = match[3]!
  const name = match[2] || homeserver

  return {
    homeserver,
    name,
  }
}
