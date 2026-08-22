import { EventType } from 'matrix-js-sdk'

export function useRoomMemberPowerLevel(
  roomId: MaybeRefOrGetter<MaybeRoomOrId | undefined>,
  maybeUserOrId: MaybeRefOrGetter<MaybeUserOrId | undefined>,
) {
  const roomMember = useRoomMember(roomId, maybeUserOrId)
  const roomPowerLevels = useRoomPowerLevels(roomId)

  const powerLevel = computed(() => roomMember.value?.powerLevel ?? 0)
  const powerLevelName = computed(() => getPowerLevelName(powerLevel.value))

  const allowed = (value: number | undefined) => (value !== undefined ? value <= powerLevel.value : false)

  const canRedact = computed(() => allowed(roomPowerLevels.value?.redact))
  const canRedactSelf = computed(() => allowed(roomPowerLevels.value?.events?.[EventType.RoomRedaction]))

  return {
    canRedact,
    canRedactSelf,
    powerLevel,
    powerLevelName,
  }
}
