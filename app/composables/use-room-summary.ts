export function useRoomSummary(
  roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>,
  via?: MaybeRefOrGetter<string[] | undefined>,
) {
  const roomId = useResolveRoomId(roomOrId)
  const viaRef = toRef(via)
  const { client } = useMatrixClient()

  return useQuery({
    queryFn: () => {
      if (!roomId.value) return null

      const via = resolveViaArray(roomId.value, viaRef.value)
      return client.value.getRoomSummary(roomId.value, via)
    },
    queryKey: $qk.roomSummary(roomId),
    refetchOnWindowFocus: true,
    retry: (count, err) => {
      if (
        isMatrixError(err) &&
        [MatrixErrorCode.M_NOT_FOUND, MatrixErrorCode.M_FORBIDDEN, MatrixErrorCode.M_UNKNOWN].includes(
          err.errcode as MatrixErrorCode,
        )
      )
        return false

      return count <= 4
    },
  })
}
