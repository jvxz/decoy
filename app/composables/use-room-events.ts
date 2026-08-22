import type { MatrixEvent, Room } from 'matrix-js-sdk'

import { Direction } from 'matrix-js-sdk'

const BATCH_SIZE = 80

const roomEventsFullyLoadedSet = reactive(new Set<string>())
const roomEventsBackfilledSet = reactive(new Set<string>())
const eventVersions = shallowReactive(new Map<string, number>())

export function getEventVersion(id: string | undefined) {
  return id ? (eventVersions.get(id) ?? 0) : 0
}

export function useRoomEvents(
  room: Ref<Room>,
  opts?: { isBusy?: Ref<boolean>; filter?: FilterMatrixEventPredicate | FilterMatrixEventPredicate[] },
) {
  const { client } = useMatrixClient()

  const events = shallowRef<MatrixEvent[]>([])

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

  const isBackfilled = computed(() => roomEventsBackfilledSet.has(room.value.roomId))

  const isBootstrapping = () => !isBackfilled.value && !isFullyLoaded.value

  const sync = () => {
    if (isBootstrapping()) return
    events.value = selectEvents(room.value.getLiveTimeline().getEvents())
  }

  const mutex = new Mutex()
  const {
    isPending: isScrolling,
    mutate: scrollEvents,
    mutateAsync: scrollEventsAsync,
  } = useMutation({
    mutationFn: async (dir: Direction) => {
      if (mutex.isLocked) {
        await mutex.acquire()
        mutex.release()
        return
      }

      await mutex.acquire()
      try {
        const r = toValue(room)
        if (!r) return

        const targetRoomId = r.roomId

        if (dir === Direction.Backward) {
          try {
            const canLoadMore = await scrollBack()
            if (targetRoomId === toValue(room).roomId) isFullyLoaded.value = !canLoadMore
          } finally {
            roomEventsBackfilledSet.add(targetRoomId)
          }
        }

        if (targetRoomId === toValue(room).roomId) sync()
      } finally {
        mutex.release()
      }
    },
    mutationKey: $mk.scrollEvents(() => room.value?.roomId),
  })

  watch(
    () => room.value.roomId,
    id => {
      if (roomEventsBackfilledSet.has(id) || isFullyLoaded.value) {
        sync()
        return
      }
      void scrollEventsAsync(Direction.Backward)
    },
    { immediate: true },
  )

  let missedSync = false
  const shouldSuppressSync = () => isScrolling.value || (opts?.isBusy?.value ?? false)

  watch(shouldSuppressSync, suppressed => {
    if (suppressed || !missedSync) return

    missedSync = false
    sync()
  })

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

  async function scrollBack() {
    if (isFullyLoaded.value) return false

    const tl = room.value.getLiveTimeline()
    const prevRenderable = renderableCount()
    const known = new Set(tl.getEvents().map(e => e.getId()))

    let canLoadMore = true
    let limit = BATCH_SIZE
    for (let attempt = 0; attempt < 7; attempt++) {
      canLoadMore = await client.value.paginateEventTimeline(tl, { backwards: true, limit })

      if (!canLoadMore || renderableCount() !== prevRenderable) break

      limit += 10
    }

    const added = tl.getEvents().filter(e => !known.has(e.getId()))
    await Promise.all(added.map(e => client.value.decryptEventIfNeeded(e)))

    return canLoadMore
  }

  return {
    events,
    getEventVersion,
    isFullyLoaded,
    scrollEvents,
    scrollEventsAsync,
  }
}
