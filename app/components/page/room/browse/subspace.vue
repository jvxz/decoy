<script lang="ts" setup>
import type { HierarchyRoom } from 'matrix-js-sdk'

const props = defineProps<{
  space: HierarchyRoom
  open: boolean
  count: number | undefined
}>()

const { conversationRooms, error, isLoading, suggestedRooms } = useSpaceHierarchy(
  () => props.space.room_id,
  () => props.open,
)
</script>

<template>
  <template v-if="!isLoading && !error && conversationRooms.size">
    <VisibleLazy v-for="room in conversationRooms.values()" :key="room.room_id" :height="72" use-injection>
      <PageRoomBrowseCard :room :suggested="suggestedRooms.has(room.room_id)" />
    </VisibleLazy>
  </template>

  <div
    v-else-if="!isLoading && !error && !conversationRooms.size"
    :class="cn('w-full relative text-sm flex items-center gap-2 text-muted-foreground px-3.5 ', $attrs.class)"
  >
    <Icon name="tabler-ghost-3" class="h-1lh" />
    <span>No rooms available</span>
  </div>

  <template v-else-if="isLoading && !error">
    <USkeleton v-for="i in Math.max(1, count ?? 4)" :key="i" class="h-18 w-full" />
  </template>

  <UCard
    v-else-if="error"
    v-bind="$props"
    variant="danger"
    :class="cn('w-full relative p-3.5 border flex-row gap-3.5 ', $attrs.class)"
  >
    Unable to get rooms. Please try again later
  </UCard>
</template>
