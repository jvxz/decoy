import type { Room } from 'matrix-js-sdk'

export function useRoomComputed<T>(
  roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>,
  getter: (room: Room | undefined) => T,
) {
  const room = useRoom(roomOrId)
  const versions = useRoomVersions()

  return computed(() => {
    const r = room.value
    if (r) void versions.get(r.roomId)
    return getter(r)
  })
}
