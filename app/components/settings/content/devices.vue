<script lang="ts" setup>
const { devices } = useDevices()
const currentDevice = useCurrentDevice()

const cachedCount = useCachedCount('devices', () => (devices.value ? devices.value.size : undefined), 4)

const { sortState } = useSortRegion('deviceList')

const sortedDevices = computed(() => {
  const sortOption = sortState.value.option
  const arr = [...devices.value]

  const res = arr.toSorted(([, a], [, b]) => {
    switch (sortOption) {
      case 'name': {
        const aName = a.display_name ?? a.device_id
        const bName = b.display_name ?? b.device_id
        return aName.localeCompare(bName)
      }
      case 'last-active': {
        const aLast = a.last_seen_ts ?? -1
        const bLast = b.last_seen_ts ?? -1
        return aLast > bLast ? 1 : -1
      }
      case 'verified': {
        const aVer = !!a.crypto?.verified
        const bVer = !!b.crypto?.verified
        return aVer && bVer ? 0 : aVer && !bVer ? 1 : -1
      }
      default:
        return 1
    }
  })

  return new Map(sortState.value.dir === 'asc' ? res : res.toReversed())
})
</script>

<template>
  <UScrollAreaRoot>
    <UScrollAreaViewport>
      <UTooltipRegionRoot name="deviceListVerifiedIcon">
        <SettingsContentLayout class="flex flex-col h-full">
          <SettingsItemPrimitive class="gap-2 w-full">
            <template #label>
              <div class="flex items-center justify-between w-full">
                <p class="font-medium">Device list</p>

                <USortSelect
                  :default-value="{ dir: 'asc', option: 'last-active' }"
                  :options="['last-active', 'name', 'verified']"
                  v-model:model-value="sortState"
                  size="sm"
                />
              </div>
            </template>

            <UCardGroupRoot variant="raised" class="w-full">
              <template v-if="sortedDevices">
                <template v-for="(device, i) in sortedDevices.values()" :key="device.device_id">
                  <UCardGroupSeparator v-if="i" />
                  <SettingsContentDevicesCard :is-current="device.device_id === currentDevice?.device_id" :device />
                </template>
              </template>

              <template v-else-if="!sortedDevices">
                <USkeleton v-for="key in cachedCount" :key class="h-17.5 w-full" />
              </template>
            </UCardGroupRoot>
          </SettingsItemPrimitive>
        </SettingsContentLayout>

        <UTooltipRegionContent v-slot="{ payload }" name="deviceListVerifiedIcon">
          {{ payload?.verified ? 'Verified' : 'Unverified' }}
        </UTooltipRegionContent>
      </UTooltipRegionRoot>
    </UScrollAreaViewport>

    <UScrollAreaScrollbars />
  </UScrollAreaRoot>
</template>
