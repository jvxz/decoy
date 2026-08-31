import type { MatrixClient } from 'matrix-js-sdk'
import type { RouteLocationRaw } from 'vue-router'

export function getRoomRoute(
  client: MatrixClient,
  room: MaybeRoomOrId,
  opts?: { currentSpace?: MaybeRoomOrId; via?: string[] },
): RouteLocationRaw {
  const { currentSpace, via = [] } = opts || {}

  const roomId = resolveRoomId(room)
  const instance = client.getRoom(roomId)
  if (!instance)
    return {
      name: 'direct-room',
      params: {
        directRoomId: roomId,
      },
      query: {
        via,
      },
    }

  if (isSpace(instance))
    return {
      name: 'space',
      params: {
        spaceId: roomId,
      },
    }

  const currentSpaceId = currentSpace ? resolveRoomId(currentSpace) : undefined

  const spaces = getRoomSpaces(client, roomId)
  const spaceId = currentSpaceId && spaces.has(currentSpaceId) ? currentSpaceId : spaces.values().next().value

  return spaceId
    ? { name: 'space-room', params: { roomId, spaceId } }
    : { name: 'direct-room', params: { directRoomId: roomId } }
}
