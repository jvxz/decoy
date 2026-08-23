import type { Token, Tokens } from 'marked'
import type { ShjLanguage } from 'rangi'

import { toRef } from '@vueuse/core'
import DOMPurify from 'dompurify'
import QuickLRU from 'quick-lru'

export type MdSegment =
  | {
      type: 'html'
      html: string
    }
  | {
      type: 'code'
      lang: ShjLanguage | (string & {})
      code: string
    }

const md = MARKED_MESSAGE_INSTANCE.use({
  async: false,
  renderer: {
    codespan: t => `<code class="bg-surface rounded px-1 py-0.5 font-mono text-[0.9em]">${t.text}</code>`,
    strong: t => `<strong class="font-medium">${t.text}</strong>`,
  },
})

const renderCache = new QuickLRU<string, MdSegment[]>({ maxSize: 512 })
const segment = (input: string) => {
  const cached = renderCache.get(input)
  if (cached) return cached

  const tokens = md.lexer(input, { breaks: true })
  const segments: MdSegment[] = []
  let buffer: Token[] = []

  const flush = () => {
    if (!buffer.length) return
    segments.push({ html: DOMPurify.sanitize(md.parser(buffer, { breaks: true })), type: 'html' })
    buffer = []
  }

  for (const token of tokens) {
    if (token.type === 'code') {
      flush()
      const { lang, text } = token as Tokens.Code
      segments.push({ code: text, lang: lang?.split(WHITESPACE_RE)[0] || 'plain', type: 'code' })
    } else buffer.push(token)
  }

  flush()
  renderCache.set(input, segments)
  return segments
}

export function useMarked(input: MaybeRefOrGetter<string | undefined>, options?: { inline?: boolean }) {
  const inputRef = toRef(input)

  return computed<MdSegment[]>(() => {
    const value = inputRef.value
    if (!value) return []

    if (options?.inline) {
      const html = DOMPurify.sanitize(md.parseInline(value, { breaks: true }) as string)
      return [{ html, type: 'html' }]
    }

    return segment(value)
  })
}
