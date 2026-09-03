type PinnedRoomsState = Map<string, ContextMenuRegions['homeRoom']['room']>

export const usePinnedRooms = createGlobalState(() => {
  const pinnedRooms = useScopedLocalStorage<PinnedRoomsState>('pinnedRooms', new Map(), {
    shallow: true,
  })

  const pinnedRoomEntries = computed(() =>
    Array.from(pinnedRooms.value.entries(), e => ({
      key: e[0],
      ...e[1],
    })),
  )

  const pinRoom = (payload: ContextMenuRegions['homeRoom']['room']) => {
    pinnedRooms.value.set(payload.roomId, payload)
    triggerRef(pinnedRooms)
  }

  const unpinRoom = (payload: ContextMenuRegions['homeRoom']['room']) => {
    pinnedRooms.value.delete(payload.roomId)
    triggerRef(pinnedRooms)
  }

  const isRoomPinned = (room: MaybeRoomOrId) => pinnedRooms.value.has(resolveRoomId(room))

  return {
    isRoomPinned,
    pinRoom,
    pinnedRoomEntries,
    pinnedRooms,
    unpinRoom,
  }
})
