<script lang="ts">
import type { MatrixEvent, Room } from 'matrix-js-sdk'

export const [injectEventListItemContext, provideEventListItemContext] = createContext<{
  event: Ref<MatrixEvent>
  room: Ref<Room>
  grouped: Ref<boolean>
}>('RoomEventGeneric')
</script>

<script lang="ts" setup>
import { EventType } from 'matrix-js-sdk'

const props = defineProps<{
  event: MatrixEvent
  grouped: boolean
  room: Room
  dateDiffed: boolean
}>()

provideEventListItemContext({
  event: toRef(props, 'event'),
  grouped: toRef(props, 'grouped'),
  room: toRef(props, 'room'),
})

const type = computed(() => props.event.getType())
</script>

<template>
  <RoomEventDateSeparator v-if="dateDiffed" :event />

  <RoomEventMessage
    v-if="type === EventType.RoomMessage || type === EventType.RoomMessageEncrypted"
  />
  <RoomEventMember v-else-if="type === EventType.RoomMember" />
</template>
