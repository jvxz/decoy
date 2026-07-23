import { readdir } from 'node:fs/promises'
import { defineNuxtModule } from 'nuxt/kit'
import { resolve } from 'pathe'

export default defineNuxtModule({
  meta: {
    name: 'palettes',
  },
  setup: async (_, nuxt) => {
    const paletteDir = resolve('.', './app/assets/css/palettes')

    const paletteFilenames = await readdir(paletteDir)
    const paletteNames = paletteFilenames.map(f => f.replace('.css', ''))
    paletteNames.forEach(p => nuxt.options.css.push(`~/assets/css/palettes/${p}.css`))

    nuxt.options.runtimeConfig.public.colorModes = paletteNames

    nuxt.hook('builder:watch', (event, path) => {
      if (['add', 'unlink'].includes(event) && path.includes('app/assets/css/palettes')) return nuxt.callHook('restart')
    })
  },
})
