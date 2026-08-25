import { MatrixError } from 'matrix-js-sdk'

export const isMatrixError = (value: unknown): value is MatrixError => value instanceof MatrixError
export const isRoomAlias = (value: string): boolean => MATRIX_ROOM_ALIAS_RE.test(value)
