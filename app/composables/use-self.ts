export const useSelf = createGlobalState(() => {
  const { client } = useMatrixClient()

  const userId = computed(() => client.value.getUserId() ?? undefined)
  const self = useUser(userId)

  return { self }
})
