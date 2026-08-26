import type { MaybeRefOrGetter } from 'vue'

import { toRef } from '@vueuse/core'

const defineKey = <const T extends readonly unknown[]>(...parts: T): T => parts

/**
 * query key factory
 */
export const $qk = {
  authMetadata: () => defineKey('authMetadata'),
  homeserverConfig: (homeserverUrl: MaybeRefOrGetter<string | undefined>) =>
    defineKey('homeserverConfig', toRef(homeserverUrl)),
  homeserverLoginFlows: (homeserverUrl: MaybeRefOrGetter<string | undefined>) =>
    defineKey('homeserverLoginFlows', toRef(homeserverUrl)),
  homeserverRegistrationFlows: (homeserverUrl: MaybeRefOrGetter<string | undefined>) =>
    defineKey('homeserverRegistrationFlows', toRef(homeserverUrl)),
  homeserverSSOUrl: (homeserverUrl: MaybeRefOrGetter<string | undefined>) =>
    defineKey('homeserverSSOUrl', toRef(homeserverUrl)),
  mutualRooms: (userId: MaybeRefOrGetter<string | undefined>) => defineKey('mutualRooms', toRef(userId)),
  publicRooms: (server: MaybeRefOrGetter<string>, query: MaybeRefOrGetter<string | undefined>) =>
    defineKey('publicRooms', toRef(server), toRef(query)),
  roomReplyEvent: (replyEventId: MaybeRefOrGetter<string | undefined>, roomId: MaybeRefOrGetter<string>) =>
    defineKey('roomReplyEvent', toRef(replyEventId), toRef(roomId)),
  roomSummary: (roomId: MaybeRefOrGetter<string | undefined>, via: MaybeRefOrGetter<string[] | undefined>) =>
    defineKey('roomSummary', toRef(roomId), toRef(via)),
  spaceSubspaces: (spaceId: MaybeRefOrGetter<string>) => defineKey('spaceSubspaces', toRef(spaceId)),
} as const

export type $QKKey = keyof typeof $qk

/**
 * mutation key factory
 */
export const $mk = {
  clientLogin: () => defineKey('clientLogin'),
  clientLogout: () => defineKey('clientLogout'),
  createRoom: () => defineKey('createRoom'),
  invite: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('invite', toRef(roomId)),
  joinRoom: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('joinRoom', toRef(roomId)),
  leaveRoom: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('leaveRoom', toRef(roomId)),
  login: () => defineKey('login'),
  message: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('message', toRef(roomId)),
  react: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('react', toRef(roomId)),
  redact: (roomId: MaybeRefOrGetter<string | undefined>, eventId: MaybeRefOrGetter<string | undefined>) =>
    defineKey('redact', toRef(roomId), toRef(eventId)),
  register: () => defineKey('register'),
  scrollEvents: (roomId: MaybeRefOrGetter<string | undefined>) => defineKey('scrollEvents', toRef(roomId)),
} as const

export type $MKKey = keyof typeof $mk
