import { createClient } from 'matrix-js-sdk'

export default defineNuxtPlugin({
  name: 'matrix',
  parallel: true,
  setup: () => {
    const matrix = createClient({ baseUrl: 'https://matrix.org' })

    return {
      provide: {
        matrix,
      },
    }
  },
})
