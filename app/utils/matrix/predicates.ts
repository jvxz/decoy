import { MatrixError } from 'matrix-js-sdk'

export const isMatrixError = (value: unknown): value is MatrixError => value instanceof MatrixError
