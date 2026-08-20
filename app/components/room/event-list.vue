<script lang="ts">
import type { TimelineScrollState } from '~/composables/use-timeline-pagination'

const MAX_CACHED_ROOMS = 32

const scrollStates = new Map<string, TimelineScrollState>()
</script>

<script lang="ts" setup>
import type { Room } from 'matrix-js-sdk'

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

const loadOlder = async () => {
  await scrollEventsAsync(Direction.Backward).catch(err => console.warn('[event-list] backward pagination:', err))
}

const {
  backSentinel,
  captureState,
  forwardSentinel,
  isPaginating,
  reset,
  restoreState,
  window: paginationWindow,
} = useTimelinePagination(containerRef, {
  followTail: true,
  getKey: e => e.getId()!,
  hasMore: dir => (dir === 'backward' ? !isFullyLoaded.value : false),
  onBeforePaginate: async dir => {
    if (dir === 'backward') await loadOlder()
  },
  source: events,
})

watchEffect(() => {
  isPaginationBusy.value = isPaginating.value.backward || isPaginating.value.forward
})

onMounted(() => {
  if (containerRef.value) initTimelineDebug(containerRef.value, useRoute().query.debug === '1')
})

const roomId = computed(() => props.room.roomId)

watch(
  roomId,
  (_next, prev) => {
    if (!prev) return

    const state = captureState()
    if (!state) return

    scrollStates.delete(prev)
    scrollStates.set(prev, state)
    if (scrollStates.size > MAX_CACHED_ROOMS) scrollStates.delete(scrollStates.keys().next().value!)
  },
  { flush: 'sync' },
)

let settledRoomId = roomId.value

watch(
  [roomId, events],
  async ([id]) => {
    const needsBootstrap = paginationWindow.value.length === 0 && events.value.length > 0
    if (id === settledRoomId && !needsBootstrap) return

    settledRoomId = id

    const saved = scrollStates.get(id)
    if (saved && (await restoreState(saved))) return

    await reset()
  },
  { flush: 'post' },
)

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

        <div ref="backSentinel" data-ignore />

        <div
          v-for="(event, idx) in groupedEvents.events"
          :key="`${event.getId() ?? idx}:${getEventVersion(event.getId() ?? '')}`"
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
        <div ref="forwardSentinel" data-ignore />

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
