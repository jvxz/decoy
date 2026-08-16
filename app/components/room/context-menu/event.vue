<script lang="ts" setup>
import type { CompactEmoji } from 'emojibase'

import { ContextMenuSubContent } from '#components'

const props = defineProps<ContextMenuRegions['event']>()

const { openDialog } = useGlobalDialog()

const { openReactionViewer } = useRoomEventReactionsViewer()
const { close } = useContextMenuRegion('event')

const { reactions, reactTo } = useRoomEventReactions(
  () => props.roomId,
  () => props.event,
)

function onEmojiPick(emoji: CompactEmoji) {
  if (props.event) {
    reactTo(emoji.unicode, true)
  }

  close()
}

const { sortedRecentReactions } = useRecentReactions()
const firstFourRecentReactions = computed(() => sortedRecentReactions.value.slice(0, 4))
</script>

<template>
  <template v-if="event && REACTABLE_EVENT_TYPES.includes(event.getType())">
    <div class="flex items-center justify-around">
      <ContextMenuItem v-for="(reaction, i) in firstFourRecentReactions" :key="i" as-child>
        <UButton
          size="icon"
          variant="ghost"
          class="grow h-full aspect-square cursor-default"
          @click="
            () => {
              reactTo(reaction.key)
              close()
            }
          "
        >
          <Twemojify class="text-6" :text="reaction.key" />
        </UButton>
      </ContextMenuItem>
    </div>
    <UContextMenuSub>
      <UContextMenuSubTrigger> Add reaction </UContextMenuSubTrigger>

      <UEmojiPickerRoot :as="ContextMenuSubContent" @pick="onEmojiPick">
        <UEmojiPickerSearch />
        <ContextMenuItem as-child>
          <UEmojiPickerList />
        </ContextMenuItem>
      </UEmojiPickerRoot>
    </UContextMenuSub>
    <UContextMenuItem :disabled="!reactions || !reactions.size" @select="openReactionViewer(roomId, event)">
      View reactions
    </UContextMenuItem>

    <UContextMenuItem
      v-if="$settings.value.advanced.developerMode"
      @click="openDialog('codeViewer', { lang: 'json', code: JSON.stringify(props.event.getContent(), null, 2) })"
    >
      View message source
    </UContextMenuItem>
  </template>
</template>
