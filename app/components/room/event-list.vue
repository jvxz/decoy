<script lang="ts" setup>
import type { Room } from 'matrix-js-sdk'

import { usePaginatedScroll } from '@jamii/vue-paginated-scroll'
import { Direction, EventType } from 'matrix-js-sdk'

const props = defineProps<{
  room: Room
}>()

const containerRef = useTemplateRef('container')
const isPaginationBusy = ref(false)

const { events, getEventVersion, isFullyLoaded, scrollEventsAsync } = useRoomEvents(toRef(props, 'room'), {
  filter: [
    EventType.Reaction,
    EventType.RoomRedaction,
    EventType.RoomPowerLevels,
    e => isBadEncrypted(e),
    e => isEditEvent(e),
  ],
  isBusy: isPaginationBusy,
})

const {
  isPaginating,
  vItem,
  window: paginationWindow,
} = usePaginatedScroll(containerRef, {
  buffer: 0.5,
  followTail: true,
  getKey: i => i.getId()!,
  maxItems: 120,
  onBeforePaginate: async dir => {
    if (dir !== 'backward') return

    const atOldestLoaded = paginationWindow.value[0]?.getId() === events.value[0]?.getId()
    if (!atOldestLoaded) return

    await scrollEventsAsync(Direction.Backward)
  },
  source: events,
  targetHeight: 5,
})

watchEffect(() => {
  isPaginationBusy.value = isPaginating.value.backward || isPaginating.value.forward
})

const groupedEvents = useEventGrouping({
  events,
  eventsPaginated: paginationWindow,
})
</script>

<template>
  <RoomEventListProviders>
    <div
      ref="container"
      class="scroll-container grid h-[calc(100%-3rem)] w-full content-end absolute overflow-x-hidden overflow-y-scroll"
      data-testid="scroll-container"
    >
      <div class="w-full" data-testid="scroll-container-wrapper">
        <div data-ignore class="h-4.25" />

        <RoomPaginateSkeleton v-if="!isFullyLoaded" />

        <div
          v-for="(event, idx) in groupedEvents.events"
          :key="`${event.getId() ?? idx}:${getEventVersion(event.getId() ?? '')}`"
          v-item="event.getId()!"
          :data-index="idx"
          :data-item-id="event.getId()"
          :style="isTestMode() ? { height: `${(event as any)._size}px` } : undefined"
        >
          <RoomEventGeneric
            :event
            :grouped="groupedEvents.grouped[idx] !== false"
            :date-diffed="!!groupedEvents.dateDiffed[idx]"
            :room
          />
        </div>
        <div data-ignore class="h-12" />
      </div>
    </div>
  </RoomEventListProviders>
</template>

<style scoped>
/* reset native scrollbar styling; breaks custom styling */
.scroll-container {
  scrollbar-color: auto;
}

.scroll-container::-webkit-scrollbar {
  width: 13px;
}

.scroll-container::-webkit-scrollbar-track {
  background-color: var(--surface);

  /* align to bottom of container  */
  margin-bottom: 3rem;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--muted-foreground);
  border-radius: 9999px;

  /* padding */
  border: 3px solid transparent;
  background-clip: content-box;
}
</style>
