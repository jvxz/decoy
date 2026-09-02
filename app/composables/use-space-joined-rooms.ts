import { EventType } from 'matrix-js-sdk'

export function useSpaceJoinedRooms(spaceId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const { client } = useMatrixClient()
  const versions = useRoomVersions()

  return useRoomComputed(spaceId, space => {
    if (!space) return []

    // track space child versions
    for (const event of getStateEvents(space, EventType.SpaceChild)) {
      const childId = event.getStateKey()
      if (childId) void versions.get(childId)
    }

    return getJoinedRooms(client.value, space)
  })
}
