export function useRoomSummary(roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const roomId = useResolveRoomId(roomOrId)
  const { client } = useMatrixClient()

  return useQuery({
    queryFn: () => {
      if (!roomId.value) return null
      const { serverName } = parseRoomId(roomId.value) ?? {}
      return client.value.getRoomSummary(roomId.value, serverName ? [serverName] : [])
    },
    queryKey: $qk.roomSummary(roomId),
    refetchOnWindowFocus: true,
    retry: (count, err) => {
      if (isMatrixError(err)) return err.errcode !== MatrixErrorCode.M_NOT_FOUND

      return count <= 4
    },
  })
}
