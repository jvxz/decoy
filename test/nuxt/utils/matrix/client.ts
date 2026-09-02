import { createClient } from 'matrix-js-sdk'

import { generateFakeHomeserver } from './credentials'

export const createMockClient = () =>
  createClient({
    baseUrl: generateFakeHomeserver(),
  })

export const mockMatrixHooks = () =>
  new Proxy<Record<string, () => void>>(
    {},
    {
      get: (_, prop) => (isString(prop) && prop.startsWith('on') ? () => {} : undefined),
    },
  )
