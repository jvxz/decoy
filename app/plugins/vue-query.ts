import type { VueQueryPluginOptions } from '@tanstack/vue-query'

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin({
  enforce: 'pre',
  name: 'vue-query',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(VueQueryPlugin, {
      enableDevtoolsV6Plugin: true,
      queryClient: new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            // 1 hour
            staleTime: 1000 * 60 * 60,
          },
        },
      }),
    } satisfies VueQueryPluginOptions)
  },
})
