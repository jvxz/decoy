import type { Room } from 'matrix-js-sdk'

import { KnownMembership, MatrixError } from 'matrix-js-sdk'

const USER_ID_RE = /^@[^\s:]+:\S+$/

export const isUserId = (input: unknown): input is string => isString(input) && USER_ID_RE.test(input)

export const isRoomId = (input: unknown): input is string => isString(input) && ROOM_ID_RE.test(input)

export const isRoomAlias = (input: string): boolean => MATRIX_ROOM_ALIAS_RE.test(input)

export const isJoined = (room: Room) => room.getMyMembership() === KnownMembership.Join

export const isMatrixError = (value: unknown): value is MatrixError => value instanceof MatrixError
