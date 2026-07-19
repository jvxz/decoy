<script lang="ts" setup>
import type { Room } from 'matrix-js-sdk'

import { VList } from 'virtua/vue'

const { room } = defineProps<{ room: Room }>()

const { isLoaded, members } = useRoomMembers(room)
const membersGrouped = useRoomMemberGrouping(members, () => room.roomId)

const cachedCount = useCachedCount(
  () => `${room.roomId}-members`,
  () => (members.value.length !== 0 ? Math.min(24, members.value.length) : undefined),
  8,
)

const listRef = useTemplateRef('list')
watch(
  () => room.roomId,
  () => listRef.value?.scrollTo(0),
)
</script>

<template>
  <div class="border-l border-border shrink-0 h-full w-72">
    <VList
      v-if="membersGrouped && isLoaded"
      :key="room.roomId"
      v-slot="{ item }"
      ref="list"
      :item-size="40"
      :data="membersGrouped.members"
      class="px-2 py-1"
    >
      <RoomMembersListHeader
        v-if="'type' in item && item.type === 'header'"
        :key="item.title"
        :title="item.title"
        :total="membersGrouped.groupTotals[item.title]"
      />

      <RoomMembersListCard v-else :key="item.userId" :is-owner="item.powerLevel >= 100" :user-id="item.userId" />
    </VList>

    <div v-else class="p-2 h-full relative">
      <USkeleton v-for="item in cachedCount" :key="item" class="mb-3 h-10 w-full" />
    </div>
  </div>
</template>
