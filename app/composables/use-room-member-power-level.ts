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

  const canRedact = computed(() => allowed(roomPowerLevels.value?.redact ?? 50))
  const canRedactSelf = computed(() => {
    const levels = roomPowerLevels.value
    return allowed(levels?.events?.[EventType.RoomRedaction] ?? levels?.events_default ?? 0)
  })

  return {
    canRedact,
    canRedactSelf,
    powerLevel,
    powerLevelName,
  }
}
