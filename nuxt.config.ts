import { name as pkgName, version as pkgVersion } from './package.json'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        style: 'background-color: var(--color-background);',
      },
      titleTemplate: '%siteName',
    },
  },

  colorMode: {
    storage: 'cookie',
  },

  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/globals.css'],

  devtools: { enabled: true },

  eslint: {
    config: {
      import: false,
      standalone: false,
    },
  },

  evlog: {
    env: {
      service: pkgName,
      version: pkgVersion,
    },
    exclude: [
      '**/_**',
    ],
    include: [
      '**/api/**',
    ],
  },

  experimental: {
    payloadExtraction: true,
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

  i18n: {
    defaultLocale: 'en',
  },

  icon: {
    provider: 'server',
  },

  imports: {
    dirs: [
      '~/utils/**/*.ts',
      '~/composables/**/*.ts',
      './shared/**/*.ts',
    ],
    presets: [
      { package: 'ufo' },
      { package: 'scule' },
      {
        from: 'evlog',
        imports: ['createError'],
        priority: 2,
      },
    ],
  },

  modules: [
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
    'evlog/nuxt',
    '@compodium/nuxt',
    '@nuxtjs/i18n',
  ],

  nitro: {
    imports: {
      dirs: [
        './server/schema/*',
        './server/utils/*',
      ],
      presets: [
        {
          from: 'zod',
          imports: ['z'],
        },
      ],
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': false,
      },
    },
    rateLimiter: process.env.NODE_ENV === 'production' ? undefined : false,
  },

  site: {
    name: pkgName,
  },
})
