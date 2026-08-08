export const useAuthMetadata = createGlobalState(() => {
  const { client } = useMatrixClient()

  const query = useQuery({
    gcTime: Infinity,
    queryFn: () => client.value.getAuthMetadata().catch(() => null),
    queryKey: $qk.authMetadata(),
    retry: false,
    staleTime: Infinity,
  })

  return {
    authMetadata: query.data,
    query,
  }
})
