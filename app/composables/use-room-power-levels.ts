import type { RoomPowerLevelsEventContent } from 'matrix-js-sdk/lib/types'

import { EventType } from 'matrix-js-sdk'

export const useRoomPowerLevels = (roomId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) =>
  useRoomComputed(roomId, room => {
    if (!room) return

    const event = head(getStateEvents(room, EventType.RoomPowerLevels))
    return event?.getContent<RoomPowerLevelsEventContent>()
  })
