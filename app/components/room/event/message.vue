<script lang="ts" setup>
import type { PopoverContentProps } from 'reka-ui'

import { MsgType } from 'matrix-js-sdk'

import { injectEventListItemContext } from './generic.vue'

const { event, grouped, room } = injectEventListItemContext()

const { data: replyEvent, isLoading: isReplyEventLoading, isReplyEvent } = useRoomReplyEvent(event.value, room.value)

const userId = computed(() => event.value.getSender())
const { content: eventContent, isDecrypting } = useEventContent(event)
const eventProfile = useUserProfile(userId)
const eventMember = useRoomMember(() => room.value.roomId, userId)

const { content: replyEventContent, isRedacted: isReplyEventRedacted } = useEventContent(() => replyEvent.value)
const replyEventBody = computed(() =>
  isReplyEventRedacted.value ? 'Original message was deleted' : formatReplyPreviewBody(replyEventContent.value?.body),
)
const replySenderId = computed(() => replyEvent.value?.getSender())
const replyEventProfile = useUserProfile(replySenderId)

const hasReactions = useRoomEventHasReactions(room, event)

const shouldRender = computed(() => {
  const type = eventContent.value?.msgtype

  const isMsg = type === MsgType.Text || type === 'm.bad.encrypted'
  const isEdit = isEditEvent(event.value)

  return (isMsg || isDecrypting.value) && !isEdit
})

const contentProps: PopoverContentProps = {
  align: 'start',
  collisionPadding: 12,
  side: 'right',
  sideOffset: 8,
}
</script>

<template>
  <RoomEvent v-if="shouldRender" :event-type="event.getType()" side="right" class="py-0.5 w-full">
    <RoomEventMessageRoot class="flex flex-col gap-px">
      <div v-if="isReplyEvent" class="text-sm flex gap-1.5 items-center relative">
        <Icon name="custom:reply" class="text-muted-foreground shrink-0 h-6 w-12 translate-x-2.5 translate-y-1" />

        <div class="ms-1.5 size-3.5 aspect-square">
          <MatrixRoomMemberAvatar
            v-if="!isReplyEventRedacted && replySenderId"
            class="size-full"
            :room
            :member="replySenderId"
          />
          <Icon v-else class="text-muted-foreground -translate-y-0.5" name="tabler:arrow-back-up" />
        </div>

        <template v-if="!isReplyEventLoading">
          <p v-if="!isReplyEventRedacted" class="text-muted-foreground font-medium">
            {{ replyEventProfile?.displayname }}
          </p>

          <p
            v-if="!isReplyEventRedacted"
            class="max-w-2/3 truncate"
            :class="{
              'italic text-muted-foreground':
                replyEvent?.isDecryptionFailure() || !replyEventBody || isReplyEventRedacted,
            }"
          >
            <Twemojify :text="replyEventBody ?? ''" />
          </p>
        </template>
        <template v-else>
          <USkeleton class="h-4 w-32" />
        </template>
      </div>

      <div class="flex gap-4">
        <UContextMenuRegionTrigger region="member" :value="{ member: eventMember, roomId: room.roomId }" as-child>
          <UProfilePopoverTrigger v-if="userId" :content-props :user="userId" as-child>
            <RoomEventMessageAvatar :room :member="userId" :ghost="grouped" />
          </UProfilePopoverTrigger>
        </UContextMenuRegionTrigger>

        <div class="w-full">
          <RoomEventMessageContent>
            <template v-if="!grouped && isDefined(event.getTs()) && userId" #header>
              <UContextMenuRegionTrigger region="member" :value="{ member: eventMember, roomId: room.roomId }" as-child>
                <UProfilePopoverTrigger :content-props :user="userId" as-child>
                  <UButton
                    variant="link"
                    class="data-popover-open:underline! context-menu-open:underline data-[state=open]:no-underline"
                  >
                    {{ eventProfile?.displayname }}
                  </UButton>
                </UProfilePopoverTrigger>
              </UContextMenuRegionTrigger>

              <RoomEventMessageTimestamp :datetime="event.getTs()" />
            </template>

            <RoomEventMessageBody v-if="!isDecrypting" :event />
            <p v-else class="italic">Decrypting message...</p>
          </RoomEventMessageContent>

          <RoomEventMessageReactions v-if="hasReactions" />
        </div>
      </div>
    </RoomEventMessageRoot>
  </RoomEvent>
</template>
