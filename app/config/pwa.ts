// https://github.com/antfu/vitesse-nuxt/blob/main/app/config/pwa.ts

import type { ModuleOptions } from '@vite-pwa/nuxt'

import process from 'node:process'

import { appMeta } from '../../shared/utils/constants'

const scope = '/'

export const pwa: ModuleOptions = {
  base: scope,
  devOptions: {
    enabled: process.env.VITE_PLUGIN_PWA === 'true',
    navigateFallback: scope,
    suppressWarnings: true,
    type: 'module',
  },
  filename: 'sw.ts',
  manifest: {
    description: appMeta.description,
    id: scope,
    name: appMeta.name,
    scope,
    short_name: appMeta.name,
    theme_color: '#5865F2',
  },
  registerType: 'autoUpdate',
  registerWebManifestInRouteRules: true,
  scope,
  srcDir: '.',
  strategies: 'injectManifest',
  workbox: {
    cleanupOutdatedCaches: true,
    disableDevLogs: true,
    globPatterns: ['**/*.{js,css,html,png,ico,svg}'],
    navigateFallback: '/',
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      {
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          cacheableResponse: {
            statuses: [0, 200],
          },
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
            maxEntries: 10,
          },
        },
        urlPattern: /^https:\/\/fonts.googleapis.com\/.*/i,
      },
      {
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          cacheableResponse: {
            statuses: [0, 200],
          },
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
            maxEntries: 10,
          },
        },
        urlPattern: /^https:\/\/fonts.gstatic.com\/.*/i,
      },
    ],
  },
  writePlugin: true,
}
