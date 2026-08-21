import twemoji from '@twemoji/api'
import { toRef } from '@vueuse/core'
import DOMPurify from 'dompurify'
import QuickLRU from 'quick-lru'

const md = MARKED_INSTANCE.use({
  async: false,
  renderer: {
    strong: t => `<strong class="font-medium">${t.text}</strong>`,
  },
})

const renderCache = new QuickLRU<string, string>({ maxSize: 512 })

const TWEMOJI_OPTIONS = { className: 'twemoji-parse', ext: '.svg', folder: 'svg' }

function parseEmoji(html: string) {
  if (!twemoji.test(html)) return html

  return html.replace(/<[^>]*>|[^<]+/g, part => (part.startsWith('<') ? part : twemoji.parse(part, TWEMOJI_OPTIONS)))
}

export function useMarked(input: MaybeRefOrGetter<string | undefined>, options?: { inline?: boolean }) {
  const inputRef = toRef(input)

  return computed(() => {
    if (!inputRef.value) return

    const cacheKey = `${options?.inline ? 'i' : 'b'}:${inputRef.value}`
    const cached = renderCache.get(cacheKey)
    if (cached !== undefined) return cached

    const html = options?.inline
      ? md.parseInline(inputRef.value, { breaks: true })
      : md.parse(inputRef.value, { breaks: true })
    const sanitized = DOMPurify.sanitize(parseEmoji(html as string))

    renderCache.set(cacheKey, sanitized)
    return sanitized
  })
}
