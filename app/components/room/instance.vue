<script lang="ts" setup>
import { KnownMembership } from 'matrix-js-sdk'

const props = withDefaults(defineProps<{ withMembersList?: boolean; room: MaybeRoomOrId | undefined }>(), {
  withMembersList: true,
})

const matrixStatus = useMatrixStatus()
const roomId = useResolveRoomId(() => props.room)
const room = useRoom(() => props.room)
const { self } = useSelf()
const membership = useRoomMembership(roomId, () => self.value?.userId)
</script>

<template>
  <RoomInstancePreview v-if="matrixStatus.isDataSynced && roomId && membership !== KnownMembership.Join" :room-id />

  <template v-else-if="room">
    <div v-if="membership === KnownMembership.Join" class="flex flex-1 size-full">
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
