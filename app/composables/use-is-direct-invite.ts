export const useIsDirectInvite = (roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) => {
  const { self } = useSelf()

  return useRoomComputed(roomOrId, room => isDirectInvite(room, self.value?.userId))
}
