<script lang="ts">
import type { MatrixEvent } from 'matrix-js-sdk'
import type { PropType } from 'vue'

import { UBlockquote } from '#components'

const tagComponentMap: Record<any, Component> = {
  blockquote: UBlockquote,
}
</script>

<script lang="ts" setup>
export interface RoomEventMessageBodyProps {
  event: MatrixEvent
}

const props = defineProps<RoomEventMessageBodyProps>()

const { messageNodes } = useMessageBodyNodes(() => props.event)

const { content: eventContent } = useEventContent(() => props.event)
const eventBody = computed(() => trimReplyFromBody(eventContent.value?.body))
const isJumboEmoji = computed(() => {
  const body = eventBody.value?.trim().replace(EMOJI_VARIATION_RE, '')
  if (!body) return false

  if (body.replace(EMOJI_RE, '').trim() !== '') return false

  const count = body.match(EMOJI_RE)?.length ?? 0
  return count > 0 && count <= 27
})

const [DefineElement, Element] = createReusableTemplate<{
  node: MessageNode
}>({
  props: {
    node: {
      required: true,
      // prevent DOM pollution
      type: Object as PropType<MessageNode>,
    },
  },
})
</script>

<template>
  <DefineElement v-slot="{ node }">
    <Twemojify
      v-if="node.type === 'text'"
      :text="node.value"
      class=""
      :class="{
        'text-4xl': isJumboEmoji,
      }"
    />

    <UCodeblock
      v-else-if="node.type === 'codeblock'"
      :input="node.value"
      :lang="node.language"
      :header="true"
      :ui="{
        root: 'my-1 max-h-108 2xl:max-w-3/4',
      }"
    />

    <UButton
      v-else-if="node.type === 'link'"
      variant="link"
      class="text-primary mx-0 px-0 w-fit"
      :style="{
        'font-size': 'inherit',
      }"
      as-child
    >
      <NuxtLink :to="node.href" external target="_blank"> {{ node.text ?? node.href }} </NuxtLink>
    </UButton>

    <RoomEventMessageBodyMention v-else-if="node.type === 'mention'" v-bind="node" />

    <component :is="tagComponentMap[node.tag] ?? node.tag" v-else-if="node.type === 'element'" v-bind="node.attrs">
      <Element v-for="(child, index) in node.children" :key="index" :node="child" />
    </component>
  </DefineElement>

  <article class="space-y-0.5">
    <Element v-for="(node, index) in messageNodes" :key="index" :node="node" />
  </article>
</template>

<style scoped>
:where(h1, h2, h3, h4, h5, p, ul, ol, blockquote, pre) + * {
  margin-block-start: 0.5em;
}

h1,
h2,
h3,
h4,
h5 {
  @apply font-medium;
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
h5 {
  @apply text-lg;
}

ul {
  @apply list-disc list-inside;
}
ol {
  @apply list-decimal list-inside;
}

strong {
  @apply font-medium;
}
</style>
