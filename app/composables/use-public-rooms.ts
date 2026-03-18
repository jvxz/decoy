import type { AsyncDataOptions } from '#app'

export function usePublicRooms(_server: MaybeRefOrGetter<string>) {
  const { $matrix, ...nuxtApp } = useNuxtApp()
  const server = computed(() => withHttps(toValue(_server ?? MATRIX_BASE_URL)))

  const getPublicRooms = (opts?: AsyncDataOptions<Awaited<ReturnType<typeof $matrix.publicRooms>>>) => useAsyncData(
    () => `publicRooms:${server.value}`,
    async () => $matrix.publicRooms({ server: server.value }),
    {
      ...opts,
      getCachedData: key => nuxtApp.payload.data?.[key] || nuxtApp.static?.data?.[key] || undefined,
      server: false,
      watch: [server],
    },
  )

  return {
    getPublicRooms,
  }
}
