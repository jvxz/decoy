import { defineConfig, presetWind4, transformerDirectives } from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: { reset: false },
    }),
    presetAnimations,
  ],
  shortcuts: {
    'page-top-padding': 'pt-36',
  },
  theme: {
    colors: {
      'accent': 'var(--accent)',
      'accent-foreground': 'var(--accent-foreground)',
      'background': 'var(--background)',
      'border': 'var(--border)',
      'card': 'var(--card)',
      'card-foreground': 'var(--card-foreground)',
      'danger': 'var(--danger)',
      'danger-foreground': 'var(--danger-foreground)',
      'foreground': 'var(--foreground)',
      'input': 'var(--input)',
      'muted': 'var(--muted)',
      'muted-foreground': 'var(--muted-foreground)',
      'overlay': 'var(--overlay)',
      'popover': 'var(--popover)',
      'popover-foreground': 'var(--popover-foreground)',
      'primary': 'var(--primary)',
      'primary-foreground': 'var(--primary-foreground)',
      'ring': 'var(--ring)',
      'secondary': 'var(--secondary)',
      'secondary-foreground': 'var(--secondary-foreground)',
    },
    duration: {
      DEFAULT: '92.5ms',
    },
    font: {
      mono: 'Paper Mono',
      sans: 'Inter',
    },
    fontWeight: {
      medium: '550',
      normal: '460',
    },
    spacing: {
      DEFAULT: '0.235rem',
    },
    tracking: {
      normal: '0.022em',
    },
  },
  transformers: [transformerDirectives({ throwOnMissing: false })],
})
