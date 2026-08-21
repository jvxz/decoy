import type { Room } from 'matrix-js-sdk'

import { KnownMembership } from 'matrix-js-sdk'

const USER_ID_RE = /^@[^\s:]+:\S+$/
const ROOM_ID_RE = /^![^\s:]+:\S+$/
const ROOM_ALIAS_RE = /^#[^\s:]+:\S+$/

export const isUserId = (input: unknown): input is string => isString(input) && USER_ID_RE.test(input)

export const isRoomId = (input: string): boolean => ROOM_ID_RE.test(input)

export const isRoomAlias = (input: string): boolean => ROOM_ALIAS_RE.test(input)

export const isJoined = (room: Room) => room.getMyMembership() === KnownMembership.Join
