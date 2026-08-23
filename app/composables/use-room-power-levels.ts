import type { RoomPowerLevelsEventContent } from 'matrix-js-sdk/lib/types'

import { EventType } from 'matrix-js-sdk'

export const useRoomPowerLevels = (roomId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) => {
  const room = useRoom(roomId)

  return computed(() => {
    if (!room.value) return

    const event = head(getStateEvents(room.value, EventType.RoomPowerLevels))
    return event?.getContent<RoomPowerLevelsEventContent>()
  })
}
