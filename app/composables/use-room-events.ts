import type { MatrixEvent, Room } from 'matrix-js-sdk'

import { Direction } from 'matrix-js-sdk'

export const BATCH_SIZE = 80

const roomEventsFullyLoadedSet = reactive(new Set<string>())

export function useRoomEvents(
  room: Ref<Room>,
  opts?: { isBusy?: Ref<boolean>; filter?: FilterMatrixEventPredicate | FilterMatrixEventPredicate[] },
) {
  const { client } = useMatrixClient()

  const events = shallowRef<MatrixEvent[]>([])
  const eventVersions = shallowReactive(new Map<string, number>())

  const isFullyLoaded = computed({
    get: () => roomEventsFullyLoadedSet.has(room.value.roomId),
    set: (v: boolean) => {
      if (v) roomEventsFullyLoadedSet.add(room.value.roomId)
      else roomEventsFullyLoadedSet.delete(room.value.roomId)
    },
  })

  const selectEvents = (liveEvents: MatrixEvent[] | undefined) => {
    const cloned = [...(liveEvents ?? [])]
    return opts?.filter ? filterMatrixEvents(cloned, opts.filter) : cloned
  }

  const renderableCount = () => selectEvents(room.value.getLiveTimeline().getEvents()).length

  const sync = () => {
    events.value = selectEvents(room.value.getLiveTimeline().getEvents())
  }

  whenever(room, sync, { immediate: true })

  let currentBatchSize = BATCH_SIZE
  const mutex = new Mutex()
  const {
    isPending: isScrolling,
    mutate: scrollEvents,
    mutateAsync: scrollEventsAsync,
    status: scrollEventsStatus,
  } = useMutation({
    mutationFn: async (dir: Direction) => {
      if (mutex.isLocked) return

      await mutex.acquire()
      try {
        const r = toValue(room)
        if (!r) return

        const targetRoomId = r.roomId

        if (dir === Direction.Backward) {
          const canLoadMore = await retry(scrollBack, {
            delay: attempts => {
              currentBatchSize = currentBatchSize + 10
              return attempts * 50
            },
            retries: 6,
            shouldRetry: err => err instanceof $Error,
          })

          if (targetRoomId === toValue(room).roomId) isFullyLoaded.value = !canLoadMore
        }

        if (targetRoomId === toValue(room).roomId) sync()
      } finally {
        mutex.release()
        currentBatchSize = BATCH_SIZE
      }
    },
    mutationKey: $mk.scrollEvents(() => room.value?.roomId),
  })

  let missedSync = false
  const shouldSuppressSync = () => isScrolling.value || (opts?.isBusy?.value ?? false)
  if (opts?.isBusy) {
    watch(opts.isBusy, busy => {
      if (!busy && missedSync) {
        missedSync = false
        sync()
      }
    })
  }

  const hookSync = () => {
    if (!shouldSuppressSync()) {
      sync()
    } else missedSync = true
  }

  useRoomHooks(() => room.value.roomId, {
    onLocalEchoUpdated: hookSync,
    onTimeline: hookSync,
    onTimelineRefresh: hookSync,
    onTimelineReset: hookSync,
  })

  const { onDecrypted } = useMatrixHooks()
  onDecrypted(event => {
    if (room.value.roomId !== event.getRoomId()) return

    const id = event.getId()
    if (!id) return

    eventVersions.set(id, (eventVersions.get(id) ?? 0) + 1)
  })

  function getEventVersion(id: string) {
    return eventVersions.get(id) ?? 0
  }

  async function scrollBack() {
    if (isFullyLoaded.value) return false

    const tl = room.value.getLiveTimeline()
    const prevRenderable = renderableCount()

    const canLoadMore = await client.value.paginateEventTimeline(tl, { backwards: true, limit: currentBatchSize })

    if (renderableCount() === prevRenderable) {
      if (!canLoadMore) return false

      throw new $Error({ message: 'pagination returned no renderable events', title: 'Unexpected error' })
    }

    return canLoadMore
  }

  return {
    events,
    getEventVersion,
    isFullyLoaded,
    scrollEvents,
    scrollEventsAsync,
    scrollEventsStatus,
  }
}
