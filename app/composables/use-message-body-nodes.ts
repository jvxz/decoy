import type { MatrixEvent } from 'matrix-js-sdk'
import type { RoomMessageTextEventContent } from 'matrix-js-sdk/lib/types'

import { EventType } from 'matrix-js-sdk'

const BLOCK_TAGS = new Set([
  'body',
  'blockquote',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'ol',
  'p',
  'pre',
  'table',
  'tbody',
  'thead',
  'tr',
  'ul',
])

type AllowedTag = (typeof MATRIX.MESSAGING.ALLOWED_TAGS)[number]

interface MessageNodeAttrs {
  href?: string
  target?: string
  start?: number
}

export type MessageNode =
  | { type: 'text'; value: string }
  | { type: 'codeblock'; value: string; language: string | undefined }
  | { type: 'mention'; mentionType: MentionType; value: string; text: string | undefined }
  | { type: 'link'; href: string; text: string | undefined }
  | {
      type: 'element'
      tag: AllowedTag
      attrs?: MessageNodeAttrs
      children: MessageNode[]
    }
  | { type: 'spoiler'; reason?: string; children: MessageNode[] }
  | { type: 'math'; latex: string; fallback: MessageNode[] }
  | { type: 'image'; mxcUrl: string; alt?: string; width?: number; height?: number }

export function useMessageBodyNodes(event: MaybeRefOrGetter<MatrixEvent>) {
  const eventRef = toRef(event)

  const messageNodes = computed<MessageNode[]>(() => {
    assert(
      [EventType.RoomMessage, EventType.Sticker, EventType.RoomMessageEncrypted].includes(
        eventRef.value.getType() as EventType,
      ),
      `invalid event type when formatting message body. was \`\${eventRef.value.getType()}\``,
    )

    const { format, body, formatted_body } = eventRef.value.getContent<RoomMessageTextEventContent>()
    if (format !== 'org.matrix.custom.html' || !formatted_body) return [{ type: 'text', value: body }]

    const raw = new DOMParser().parseFromString(formatted_body, 'text/html')

    const firstElement = raw.body.firstElementChild
    if (firstElement?.localName === 'mx-reply') firstElement.remove()

    const safeHtml = sanitizeFormattedBody(raw.body.innerHTML)

    const safe = new DOMParser().parseFromString(safeHtml, 'text/html')

    return walkNodes(safe.body)
  })

  return {
    messageNodes,
  }
}

function walkNodes(el: HTMLElement): MessageNode[] {
  const nodes: MessageNode[] = []

  function transform(el: HTMLElement) {
    const isBlock = BLOCK_TAGS.has(el.tagName.toLowerCase())

    for (const node of el.childNodes) {
      console.log('node: ', node)
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue ?? ''
        if (isBlock && !value.trim()) continue
        nodes.push({
          type: 'text',
          value,
        })
        continue
      }

      if (!(node instanceof HTMLElement)) continue

      if (node.tagName.toLowerCase() === 'code') {
        nodes.push({
          language: node.classList
            .values()
            .find(cls => cls.startsWith('language-'))
            ?.replace('language-', ''),
          type: 'codeblock',
          value: node.textContent ?? '',
        })
      } else if (node.tagName.toLowerCase() === 'a') {
        const href = decodeURIComponent(node.getAttribute('href') ?? '')
        const { type, value } = resolveMentionHref(href)
        if (type !== 'unknown') {
          const mentionSigil = type === 'user' ? '@' : type === 'roomAlias' ? '#' : '!'

          nodes.push({
            mentionType: type,
            text: node.textContent?.startsWith(mentionSigil) ? node.textContent : `${mentionSigil}${node.textContent}`,
            type: 'mention',
            value,
          })
        } else {
          nodes.push({
            href,
            text: node.textContent,
            type: 'link',
          })
        }
      } else {
        nodes.push({
          attrs: readRenderAttrs(node),
          children: walkNodes(node),
          tag: node.tagName.toLowerCase() as AllowedTag,
          type: 'element',
        })
      }
    }
  }

  transform(el)

  return nodes
}

function readRenderAttrs(el: HTMLElement): MessageNodeAttrs {
  return Object.fromEntries(Array.from(el.attributes, ({ name, value }) => [name, value]))
}
