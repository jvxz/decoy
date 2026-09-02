import type { Room } from 'matrix-js-sdk'
import type { WatchSource } from 'vue'

export interface RoomAxes {
  directRoomIds: ReadonlySet<string>
  inSpaceRoomIds: ReadonlySet<string>
}

export function useRooms(
  predicate: (room: Room, axes: RoomAxes) => boolean,
  opts?: {
    watch?: WatchSource<any> | WatchSource<any>[]
    excludeUnjoined?: MaybeRefOrGetter<boolean>
  },
) {
  const { excludeUnjoined = true } = opts ?? {}
  const { client } = useMatrixClient()

  const rooms = shallowRef<Room[]>([])
  const refresh = () => {
    const directRoomIds = new Set(getDirectRooms(client.value).map(d => d.roomId))
    const inSpaceRoomIds = getInSpaceRoomIds(client.value)

    rooms.value = client.value
      .getRooms()
      .filter(
        room =>
          (toValue(excludeUnjoined) ? isJoined(room) : true) && predicate(room, { directRoomIds, inSpaceRoomIds }),
      )
  }

  const { onRoom, onRoomMyMembership, onSync } = useMatrixHooks()
  onSync(refresh)
  onRoom(refresh)
  onRoomMyMembership(refresh)

  refresh()
  if (opts?.watch) watch(opts.watch, refresh)

  return rooms
}
