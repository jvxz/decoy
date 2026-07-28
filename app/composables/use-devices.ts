import type { Device, IMyDevice } from 'matrix-js-sdk'

export interface DeviceEntry extends IMyDevice {
  crypto: Device | undefined
}

export const useDevices = createGlobalState(() => {
  const { self } = useSelf()
  const { client } = useMatrixClient()

  const cryptoDevices = useQuery({
    enabled: () => !!self.value?.userId,
    gcTime: Infinity,
    queryFn: async () => {
      const map = await getUserDevices(client.value)
      return map.get(client.value.getSafeUserId())!
    },
    queryKey: $qk.cryptoDevices(() => self.value?.userId),
    staleTime: 0,
  })

  const sessionDevices = useQuery({
    enabled: () => !!self.value?.userId,
    gcTime: Infinity,
    queryFn: () => client.value.getDevices().then(r => r.devices),
    queryKey: $qk.sessionDevices(() => self.value?.userId),
    staleTime: 0,
  })

  const { onDevicesUpdated } = useMatrixHooks()
  onDevicesUpdated(() => {
    cryptoDevices.refetch()
    sessionDevices.refetch()
  })

  const devices = computed<Map<string, DeviceEntry>>(() => {
    const crypto = cryptoDevices.data.value
    const sessions = sessionDevices.data.value
    if (!crypto || !sessions) return new Map()

    return new Map(
      sessions.map(session => [
        session.device_id,
        {
          ...session,
          crypto: crypto.get(session.device_id),
        },
      ]),
    )
  })

  const error = computed(() => cryptoDevices.error.value ?? sessionDevices.error.value)

  return { cryptoDevices, devices, error, sessionDevices }
})
