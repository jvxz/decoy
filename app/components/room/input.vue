<script lang="ts" setup>
import type { Editor } from '@tiptap/core'
import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { CompactEmoji } from 'emojibase'
import type { RoomMember } from 'matrix-js-sdk'
import type { IHierarchyRoom } from 'matrix-js-sdk/lib/@types/spaces'

import { Extension } from '@tiptap/core'
import { Mention } from '@tiptap/extension-mention'
import { Placeholder } from '@tiptap/extension-placeholder'
import { useFilter } from 'reka-ui'
import CodeBlockShiki from 'tiptap-extension-code-block-shiki'
import { VList } from 'virtua/vue'

const currentRoom = useCurrentRoom()
const currentSpace = useCurrentSpace()

const content = shallowRef('')

const { areMembersTyping, onType } = useRoomMembersTyping.provide(currentRoom)

const { contains } = useFilter({ sensitivity: 'base' })

const { members } = useRoomMembers(currentRoom)
const { rooms } = useSpaceHierarchy(() => currentSpace.value?.roomId)
const roomsArray = computed(() => (rooms.value ? rooms.value.values().toArray() : []))

const { emojiData } = useEmojiData()

type SuggestionItem = { id: string; label: string; commandProps: Record<string, any> } & (
  | {
      user: RoomMember
      room?: never
      emoji?: never
    }
  | {
      user?: never
      emoji?: never
      room: IHierarchyRoom
    }
  | {
      user?: never
      emoji: CompactEmoji
      room?: never
    }
)

const open = shallowRef(false)
const highlightedIdx = shallowRef(0)
const filteredItems = shallowRef<SuggestionItem[]>([])
let command: ((props: MentionNodeAttrs) => void) | undefined

const listHeight = computed(() => Math.min(filteredItems.value.length, 7) * 32)

// const { message } = useRoomActions(currentRoom)
const { sendTextMessage } = useRoomMessaging(currentRoom)

function selectItem(item: SuggestionItem) {
  command?.(item.commandProps as MentionNodeAttrs)
}

function createSuggestion(
  char: string,
  getItems: (props: { query: string; editor: Editor }) => SuggestionItem[],
  opts?: {
    onUpdate?: (props: SuggestionProps<any, MentionNodeAttrs>) => void
    shouldOpen?: (props: SuggestionProps<any, MentionNodeAttrs>) => boolean
    command: SuggestionOptions['command']
  },
): Omit<SuggestionOptions<any, MentionNodeAttrs>, 'editor'> {
  return {
    char,
    ...(opts?.command && { command: opts.command }),
    items: getItems,
    render: () => ({
      onExit: () => (open.value = false),
      onKeyDown: ({ event }) => {
        const items = filteredItems.value
        if (!items.length) return false
        switch (event.key) {
          case 'ArrowUp':
            highlightedIdx.value = clamp(highlightedIdx.value - 1, 0, items.length - 1)
            return true
          case 'ArrowDown':
            highlightedIdx.value = clamp(highlightedIdx.value + 1, 0, items.length - 1)
            return true
          case 'Enter':
            selectItem(items[highlightedIdx.value]!)
            return true
          case 'Escape':
            open.value = false
            return true
        }
        return false
      },
      onStart: ({ command: commandLocal, items, ...rest }) => {
        command = commandLocal
        filteredItems.value = items
        highlightedIdx.value = 0
        open.value = opts?.shouldOpen ? opts.shouldOpen({ ...rest, command: commandLocal, items }) : true
      },
      onUpdate: ({ command: commandLocal, items, ...rest }) => {
        open.value = opts?.shouldOpen ? opts.shouldOpen({ ...rest, command: commandLocal, items }) : true
        opts?.onUpdate?.({ ...rest, command: commandLocal, items })
        command = commandLocal
        filteredItems.value = items
        highlightedIdx.value = 0
      },
    }),
  }
}

const editor = useEditor({
  extensions: [
    TiptapStarterKit.configure({
      bold: false,
      code: false,
      codeBlock: false,
      heading: false,
      italic: false,
      link: false,
      strike: false,
      trailingNode: false,
      underline: false,
    }),
    CodeBlockShiki.configure({
      defaultTheme: 'github-dark-default',
    }),
    EmojiNode.configure({
      suggestion: createSuggestion(
        ':',
        ({ query }) =>
          (emojiData.value?.emojis ?? [])
            .filter(e => [e.label, e.hexcode].some(v => contains(v, query)))
            .slice(0, 50)
            .map(e => ({
              commandProps: { hexcode: e.hexcode, label: e.label, unicode: e.unicode },
              emoji: e,
              id: e.hexcode,
              label: e.unicode,
            })),
        {
          command: ({ editor, props, range }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                { attrs: props, type: 'emoji' },
                { text: ' ', type: 'text' },
              ])
              .run()
          },
          shouldOpen: ({ query }) => A_TO_Z_RE.test(query),
        },
      ),
    }),
    Mention.configure({
      suggestions: [
        createSuggestion('#', ({ query }) =>
          roomsArray.value
            .filter(r => r.name && contains(r.name, query))
            .map(r => ({
              commandProps: { id: r.room_id, label: r.name ?? r.room_id, room: r },
              id: r.room_id,
              label: r.name ?? r.room_id,
              room: r,
            })),
        ),
        createSuggestion('@', ({ query }) =>
          (members.value ?? [])
            .filter(u => [resolveUserName(u), u.userId].some(v => contains(v, query)))
            .map(u => ({
              commandProps: { id: u.userId, label: resolveUserName(u), user: u },
              id: u.userId,
              label: resolveUserName(u),
              user: u,
            })),
        ),
      ],
    }),
    InlineMarks,
    Placeholder.configure({
      placeholder: () => `Message ${currentRoom.value?.name}`,
    }),
    Extension.create({
      addKeyboardShortcuts() {
        return {
          Enter: ({ editor }) => {
            if (open.value) return false

            const plainBody = nodeToPlainBody(editor.state.doc).trim()
            if (!plainBody) return true

            const mentionedUserIds = new Set<string>()
            editor.state.doc.descendants(node => {
              if (node.type.name === 'mention') {
                const id = node.attrs.id as string
                if (id.startsWith('@')) mentionedUserIds.add(id)
              }
            })

            const formattedBody = nodeToFormattedBody(editor.state.doc)
            const sanitizedFormattedBody = sanitizeFormattedBody(formattedBody)
            sendTextMessage(plainBody, sanitizedFormattedBody, mentionedUserIds)

            onType(true)

            editor.commands.clearContent()

            return true
          },
          Escape: () => {
            this.editor.commands.blur()
            return true
          },
        }
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getText()
    if (content.value.trim()) {
      onType()
    } else {
      onType(true)
    }
  },
})

watch(currentRoom, () => {
  editor.value?.view.dispatch(editor.value.view.state.tr)
})

onStartTyping(e => editor.value?.chain().focus('end').insertContent(e.key).run())

const vlist = useTemplateRef('vlist')
watch(highlightedIdx, idx => vlist.value?.scrollToIndex(idx, { align: 'nearest' }))
</script>

<template>
  <div
    class="mb-3 px-3 rounded flex shrink-0 flex-col w-full cursor-text bottom-0 absolute isolate"
    @mousedown="
      e => {
        const { target } = e
        if ((target as Element | undefined)?.closest('button, .ProseMirror')) return
        e.preventDefault()
        editor?.commands.focus('end')
      }
    "
  >
    <RoomInputMembersTyping v-if="!open" />

    <div v-if="open" :class="cn(popoverContentBase(), 'w-full border-border-strong h-full bg-secondary mb-3.5')">
      <VList
        v-if="filteredItems.length"
        ref="vlist"
        v-slot="{ item, index }"
        :data="filteredItems"
        :style="{
          minHeight: `${listHeight}px`,
        }"
      >
        <UButton
          :key="item.id"
          variant="ghost"
          :data-highlighted="highlightedIdx === index"
          class="gap-2 w-full justify-start data-[highlighted=false]:(text-muted-foreground bg-transparent hover:text-muted-foreground hover:bg-transparent) data-[highlighted=true]:(text-foreground bg-secondary-raised hover:bg-secondary-raised)"
          @mouseenter="highlightedIdx = index"
          @mousedown.prevent="selectItem(item)"
        >
          <MatrixAvatar v-if="item.user" class="h-4 w-fit" :room-member="item.user" />
          <MatrixAvatar v-else-if="item.room" class="h-4 w-fit" :room="item.room.room_id" />
          <Twemoji v-else :emoji="item.emoji.hexcode" />

          <span class="text-foreground">{{ item.label }}</span>
          <span v-if="!item.emoji" class="text-xs font-normal">{{ item.id }}</span>
        </UButton>
      </VList>

      <UButton v-else variant="ghost" disabled class="gap-2 w-full justify-start opacity-100!">
        <span class="text-muted-foreground font-normal">No results</span>
      </UButton>
    </div>

    <div
      class="px-3.5 py-0 rounded bg-input flex gap-3.5 size-full min-h-user-card-height ring-1 ring-border ring-inset *:shrink-0 has-focus-visible:ring-border-strong"
    >
      <UButton variant="ghost" size="icon" class="mt-[calc((var(--spacing-user-card-height)-2rem)/2)]">
        <Icon name="tabler:plus" class="size-5" />
      </UButton>

      <div
        class="py-[calc((var(--spacing-user-card-height)-1.5rem)/2)] flex-1 max-h-128 overflow-scroll overflow-x-hidden scrollbar-gutter-stable"
      >
        <TiptapEditorContent role="presentation" :editor />
      </div>

      <UButton
        variant="ghost"
        size="icon"
        :disabled="!content"
        class="mt-[calc((var(--spacing-user-card-height)-2rem)/2)]"
      >
        <Icon name="tabler:send" class="size-5" />
      </UButton>
    </div>

    <div
      v-if="!open"
      aria-hidden="true"
      class="h-12 w-full pointer-events-none transition-all ease absolute from-surface to-transparent from-75% bg-linear-to-t -mx-3 -z-2"
      :class="areMembersTyping ? '-top-1' : 'bottom-0'"
    />
  </div>
</template>

<style>
.ProseMirror {
  @apply outline-0 flex flex-col justify-center;
}

.tiptap {
  .md-marker {
    @apply text-muted-foreground;
    text-decoration: none;
    font-style: normal;
  }

  .md-codespan:not(.md-marker),
  pre {
    @apply bg-muted font-mono px-0.5 -m-0.25 mx-0.75 rounded-sm;
  }

  .md-em:not(.md-marker) {
    @apply italic;
  }

  .md-link:not(.md-marker) {
    @apply underline text-primary cursor-pointer;
  }

  .md-strikethrough:not(.md-marker) {
    text-decoration: line-through;
  }

  .md-strong:not(.md-marker) {
    @apply font-medium;
  }

  .md-underline:not(.md-marker) {
    @apply underline;
  }

  [data-type='mention'] {
    @apply bg-primary/50 px-0.5 -m-0.25 mx-0.75 rounded-sm;
    user-select: auto;
  }

  p.is-editor-empty:first-child::before {
    @apply text-muted-foreground h-0 pointer-events-none;
    content: attr(data-placeholder);
    float: left;
  }

  blockquote {
    @apply border-l-3 border-border-strong pl-3 text-muted-foreground;
  }

  h1 {
    @apply text-4xl;
  }
  h2 {
    @apply text-3xl;
  }
  h3 {
    @apply text-2xl;
  }
  h4 {
    @apply text-xl;
  }

  li p {
    display: inline;
  }

  ul,
  ol {
    padding-left: 1.5em;
    list-style-type: disc;
  }

  ul ul {
    list-style-type: circle;
  }
  ul ul ul {
    list-style-type: square;
  }
}
</style>
