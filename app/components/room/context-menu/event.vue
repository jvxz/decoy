<script lang="ts" setup>
import type { CompactEmoji } from 'emojibase'

import { ContextMenuSubContent } from '#components'

const props = defineProps<ContextMenuRegions['event']>()

const { openDialog } = useGlobalDialog()

const { openReactionViewer } = useRoomEventReactionsViewer()
const { close } = useContextMenuRegion('event')
const { self } = useSelf()

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

const powerLevel = useRoomMemberPowerLevel(
  () => props.roomId,
  () => self.value?.userId,
)

const canRedact = computed(() => {
  if (props.event.getSender() === self.value?.userId) return powerLevel.canRedactSelf.value
  return powerLevel.canRedact.value
})

const { current } = useMagicKeys()
const { redact } = useRoomActions(
  () => props.roomId,
  () => props.event.getId(),
)
const handleDeleteMessage = () => {
  if (current.has('shift')) redact.mutate({ reason: undefined })
  else openDialog('deleteMessage', { eventId: props.event.getId()!, roomId: props.roomId })
}
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

    <UContextMenuItem v-if="canRedact" variant="danger" @select="handleDeleteMessage">
      Delete message
    </UContextMenuItem>

    <template v-if="$settings.value.advanced.developerMode">
      <UContextMenuSeparator />

      <UContextMenuItem
        @select="openDialog('codeViewer', { lang: 'json', code: JSON.stringify(props.event, null, 2) })"
      >
        View source
      </UContextMenuItem>
    </template>
  </template>
</template>
