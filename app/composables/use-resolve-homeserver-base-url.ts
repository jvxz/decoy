export const useResolveHomeserverBaseUrl = (homeserverUrl: MaybeRefOrGetter<string | undefined>) => {
  const homeserverUrlRef = toRef(homeserverUrl)

  const { data: config } = useHomeserverConfig(homeserverUrlRef)
  const baseUrl = computed(() => config.value?.['m.homeserver'].base_url ?? homeserverUrlRef.value)

  return baseUrl
}
