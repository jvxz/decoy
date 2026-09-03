export function useInviter(roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const room = useRoom(roomOrId)
  const { self } = useSelf()

  const inviterId = useRoomComputed(room, r => {
    if (!self.value) return
    return getInviter(r, self.value.userId)
  })

  return useRoomMember(room, inviterId)
}
