import type { NuxtPage } from 'nuxt/schema'

import { pwa } from './app/config/pwa'
import { DEFAULT_COLOR_MODE } from './shared/constants/color-mode'
import { appMeta } from './shared/utils/constants'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        style: 'background-color: var(--color-background);',
      },
      titleTemplate: 'Magi',
    },
  },

  colorMode: {
    fallback: DEFAULT_COLOR_MODE,
    preference: DEFAULT_COLOR_MODE,
    storage: 'cookie',
    storageKey: 'theme',
  },

  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/globals.css', '~/assets/css/transitions.css'],

  devtools: { enabled: true },

  eslint: {
    config: {
      import: false,
      standalone: false,
    },
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
    typescriptPlugin: true,
  },

  fonts: {
    defaults: {
      preload: true,
      weights: ['100 900'],
    },
  },

  future: {
    compatibilityVersion: 5,
  },

  hooks: {
    'pages:extend': pages => {
      function requireAuth(pages: NuxtPage[]) {
        for (const page of pages) {
          if (page?.path.startsWith('/app')) {
            page.meta ||= {}
            page.meta.requiresAuth = true
          }
          if (page.children) requireAuth(page.children)
        }
      }
      requireAuth(pages)
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
      },
    ],
    parallelPlugin: true,
    strategy: 'no_prefix',
    vueI18n: './i18n.config.ts',
  },

  icon: {
    clientBundle: {
      scan: true,
    },
    customCollections: [{ dir: './app/assets/icons', prefix: 'custom', provider: 'none' }],
  },

  imports: {
    dirs: ['~/utils/**/*.ts', '~/config/**/*.ts', '~/composables/**/*.ts', '~/constants/**/*.ts', '~~/shared/**/*.ts'],
    presets: [
      { ignore: ['isEqual'], package: 'es-toolkit' },
      { package: 'ufo' },
      { package: 'tailwind-variants' },
      { package: 'tailwind-merge' },
      {
        from: 'valibot',
        imports: [{ as: 'v', name: '*' }],
      },
      {
        from: 'temporal-polyfill',
        imports: ['Temporal'],
      },
    ],
  },

  modules: [
    '~/modules/palettes',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@unocss/nuxt',
    'nuxt-security',
    '@vueuse/nuxt',
    'reka-ui/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    'nuxt-vitalizer',
    '@regle/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/test-utils/module',
    '@peterbud/nuxt-query',
    'motion-v/nuxt',
    'nuxt-twemoji',
    'nuxt-tiptap-editor',
    '@nuxtjs/i18n',
  ],

  nitro: {
    cloudflare: {
      nodeCompat: true,
    },

    imports: {
      dirs: ['./server/schema/*', './server/utils/*'],
      presets: [
        {
          from: 'valibot',
          imports: [{ as: 'v', name: '*' }],
        },
      ],
    },
  },

  nuxtQuery: {
    autoImports: ['useMutation', 'useQueryClient'],
    devtools: true,
    queryClientOptions: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: true,
          // 1 hour
          staleTime: 1000 * 60 * 60,
        },
      },
    },
  },

  pwa,

  routeRules: {
    '/_nuxt/**': {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    '/app': { appMiddleware: 'home-redirect' },
    '/app/**': { ssr: false },
    '/app/me': { appMiddleware: 'home-redirect' },
    '/login/**': { ssr: false },
    '/playground': { appLayout: false },
  },

  runtimeConfig: {
    public: {
      showLoadTime: false,
    },
  },

  // nuxt-schema-org currently does not support unhead v3
  schemaOrg: {
    enabled: false,
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': false,
        'script-src': import.meta.dev
          ? false
          : ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'", "'wasm-unsafe-eval'"],
      },
    },
    rateLimiter: false,
    sri: false,
  },

  site: {
    name: appMeta.name,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        allowImportingTsExtensions: true,
      },
    },
  },

  vite: {
    worker: {
      format: 'es',
    },
  },
})
