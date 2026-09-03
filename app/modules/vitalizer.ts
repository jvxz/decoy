// https://github.com/johannschopplich/nuxt-vitalizer
import type { Plugin } from 'vite'
import type { ResourceMeta } from 'vue-bundle-renderer'

import { defineNuxtModule, useLogger } from 'nuxt/kit'

export default defineNuxtModule({
  defaults: {
    disablePrefetchLinks: 'dynamicImports',
    disablePreloadLinks: false,
    disableStylesheets: false,
  },
  meta: {
    name: 'vitalizer',
  },
  setup(_, nuxt) {
    if (nuxt.options._prepare || nuxt.options.dev) return

    const inlinedStylesheets = new Set<string>()

    nuxt.hook('vite:extendConfig', (config, { isClient }) => {
      if (isClient)
        config.plugins?.push(collectInlinedStylesheets(inlinedStylesheets, nuxt.options.features.inlineStyles))
    })

    nuxt.hook('build:manifest', manifest => {
      for (const entry of Object.values(manifest)) {
        stripResourceHints(entry, inlinedStylesheets)
      }
      useLogger('vitalizer').success('optimized vitals')
    })
  },
})

const CSS_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)(?:\?[^.]+)?$/
const QUERY_RE = /\?.*$/

export function collectInlinedStylesheets(
  inlined: Set<string>,
  shouldInline: boolean | ((id?: string) => boolean),
): Plugin {
  return {
    applyToEnvironment: environment => environment.name === 'client',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue

        const stylesheets = chunk.viteMetadata?.importedCss
        if (!stylesheets?.size) continue

        const sources = new Set<string>()
        for (const moduleId of chunk.moduleIds) {
          if (CSS_RE.test(moduleId)) sources.add(moduleId)

          for (const importedId of this.getModuleInfo(moduleId)?.importedIds ?? []) {
            if (CSS_RE.test(importedId)) sources.add(importedId)
          }
        }

        const isFromVueAlone =
          sources.size > 0 &&
          [...sources].every(source => {
            const moduleId = source.replace(QUERY_RE, '')
            return (
              moduleId.endsWith('.vue') &&
              (shouldInline === true || (typeof shouldInline === 'function' && shouldInline(moduleId)))
            )
          })
        if (!isFromVueAlone) continue

        for (const stylesheet of stylesheets) {
          inlined.add(basename(stylesheet))
        }
      }
    },
    name: 'vitalizer:inlined-stylesheets',
  }
}

export function stripResourceHints(entry: ResourceMeta, inlinedStylesheets: ReadonlySet<string>) {
  entry.prefetch = false
  entry.dynamicImports = []
  entry.preload = false

  if (entry.resourceType === 'script' && !entry.src) {
    entry.css = entry.css?.filter(stylesheet => !inlinedStylesheets.has(basename(stylesheet)))
  }
}

export function basename(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}
