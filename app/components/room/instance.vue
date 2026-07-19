<script lang="ts" setup>
const props = withDefaults(defineProps<{ withMembersList?: boolean; room: MaybeRoomOrId | undefined }>(), {
  withMembersList: true,
})
const roomId = useResolveRoomId(() => props.room)
const room = useRoom(() => props.room)
const { data: summary } = useRoomSummary(() => props.room)
const isJoined = useRoomIsJoined(room)
</script>

<template>
  <RoomInstancePreview v-if="!room && !isJoined && roomId" :summary :room-id />

  <template v-else-if="room">
    <div v-if="isJoined" class="flex flex-1 size-full">
      <div class="flex flex-col size-full relative">
        <RoomEventList :room />
        <RoomInput />
      </div>

      <RoomMembersList v-if="withMembersList" :room />
      <RoomEventReactionsViewer />
    </div>

    <div v-else>your not joined</div>
  </template>
</template>
