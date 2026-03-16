import type { AsyncDataOptions } from '#app'

export function useMatrix() {
  const { $matrix } = useNuxtApp()

  const getPublicRooms = (opts?: AsyncDataOptions<Awaited<ReturnType<typeof $matrix.publicRooms>>>) => useAsyncData('publicRooms', async () => $matrix.publicRooms(), {
    ...opts,
    server: false,
  })


  return {
    client: $matrix,
    getPublicRooms,
  }
}
