export const useRoomVersions = createSharedComposable(() => {
  const versions = shallowReactive(new Map<string, number>())
  const {
    onRoom,
    onRoomLocalEchoUpdated,
    onRoomMyMembership,
    onRoomName,
    onRoomReceipt,
    onRoomRedaction,
    onRoomState,
    onRoomTags,
    onRoomTimeline,
    onRoomTimelineReset,
  } = useMatrixHooks()

  const bump = (id: string) => versions.set(id, (versions.get(id) ?? 0) + 1)

  onRoomTimeline((_e, room) => room && bump(room.roomId))
  onRoomTimelineReset(room => room && bump(room.roomId))
  onRoomName(room => bump(room.roomId))
  onRoomReceipt((_e, room) => bump(room.roomId))
  onRoomMyMembership(room => bump(room.roomId))
  onRoomTags((_e, room) => bump(room.roomId))
  onRoomRedaction((_e, room) => bump(room.roomId))
  onRoomLocalEchoUpdated((_e, room) => bump(room.roomId))
  onRoomState(state => bump(state.roomId))
  onRoom(room => bump(resolveRoomId(room)))

  return versions
})
