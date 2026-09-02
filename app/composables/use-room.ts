import { toRef } from '@vueuse/core'
import { Room } from 'matrix-js-sdk'

export function useRoom(roomInput: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const inputRef = toRef(roomInput)
  const { client } = useMatrixClient()
  const versions = useRoomVersions()

  const room = computed(() => {
    const input = toValue(inputRef)
    if (!input) return undefined

    void versions.get(resolveRoomId(input))

    if (input instanceof Room) return markRaw(input)

    const cachedRoom = getRoom(client.value, input)
    return cachedRoom ? markRaw(cachedRoom) : undefined
  })

  return room
}
