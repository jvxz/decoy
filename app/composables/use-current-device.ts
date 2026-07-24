export const useCurrentDevice = createGlobalState(() => {
  const { client } = useMatrixClient()
  const { devices } = useDevices()

  const currentDeviceId = computed(() => client.value.deviceId)

  return computed(() => {
    if (!currentDeviceId.value || !devices.value) return
    return devices.value.get(currentDeviceId.value)
  })
})
