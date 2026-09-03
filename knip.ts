import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['app/components/**/*.{vue,ts}', 'app/sw.ts', 'taze.config.ts'],
  ignoreDependencies: [
    '@iconify-json/*',
    '@types/grecaptcha',
    'temporal-polyfill',
    '@regle/core',
    '@regle/rules',
    '@tiptap/vue-3',
    '@unocss/rule-utils',
    'prosemirror-view',
    'vitest-environment-nuxt',
    'workbox-expiration',
    'workbox-precaching',
    'workbox-strategies',
  ],
  project: ['**/*.{ts,vue,cjs,mjs}', '!test/fixtures/**', '!test/test-utils/**', '!test/e2e/helpers/**'],
}

export default config
