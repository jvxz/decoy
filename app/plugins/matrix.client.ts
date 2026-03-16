import { createClient } from 'matrix-js-sdk'

export default defineNuxtPlugin({
  name: 'matrix',
  parallel: true,
  setup: () => {
    const matrix = createClient({ baseUrl: MATRIX_BASE_URL })

    return {
      provide: {
        matrix,
      },
    }
  },
})
