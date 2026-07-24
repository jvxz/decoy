<script lang="ts">
const keyNameMap = {
  device_id: 'Device ID',
  display_name: 'Display name',
  last_seen_ip: 'IP address',
  last_seen_ts: 'Last active',
  last_seen_user_agent: 'User agent',
  'org.matrix.msc3852.last_seen_user_agent': 'User agent',
}
</script>

<script lang="ts" setup>
const { device } = defineProps<{ device: DeviceEntry | undefined; isCurrent?: boolean }>()

const targetDetails = computed(() =>
  device
    ? pick(omitBy(device, isNil), [
        'device_id',
        'display_name',
        'last_seen_ts',
        'last_seen_ip',
        'last_seen_user_agent',
        'org.matrix.msc3852.last_seen_user_agent',
      ])
    : undefined,
)

const timeSinceActive = useTimeAgoIntl(() => targetDetails.value?.last_seen_ts ?? -1)
const timeSinceActiveText = computed(() =>
  targetDetails.value?.last_seen_ts ? `Last active ${timeSinceActive.value}` : `Last active (unknown)`,
)

const verified = computed(() => !!device?.crypto?.verified)
</script>

<template>
  <CollapsibleRoot as-child>
    <UCardGroupItem class="w-full" variant="raised">
      <div class="flex gap-3 items-center">
        <div class="rounded-sm bg-surface-top flex shrink-0 size-12 items-center justify-center">
          <Icon name="tabler:device-desktop" class="size-1/2" />
        </div>

        <UCardGroupItemHeader class="flex flex-col w-full self-stretch justify-evenly">
          <template v-if="device">
            <UCardGroupItemTitle class="flex gap-2 text-clip">
              <span :title="device.display_name ?? device.device_id" class="w-fit truncate">
                {{ device.display_name ?? device.device_id }}
              </span>

              <UTooltipRegionTrigger region="deviceListVerifiedIcon" :value="{ verified }">
                <Icon v-if="verified" class="text-muted-foreground" name="tabler:rosette-discount-check" />
                <Icon v-else class="text-danger" name="tabler:alert-triangle" />
              </UTooltipRegionTrigger>
            </UCardGroupItemTitle>
          </template>
          <USkeleton v-else class="rounded-sm h-1em w-1/4" />

          <UCardGroupItemDescription v-if="targetDetails" class="text-clip">
            <CollapsibleTrigger as-child>
              <UButton
                title="More details"
                variant="ghost-inline"
                class="group font-normal gap-1.5 data-[state=open]:text-muted-foreground"
              >
                <template v-if="isCurrent">
                  <div class="rounded-full bg-success size-0.5em" />
                  <span class="text-success">Current device</span>
                  <UInlineSeparator />
                </template>
                <span>{{ timeSinceActiveText }}</span>
                <Icon name="tabler:chevron-down" class="h-1em group-data-[state=open]:rotate-180" />
              </UButton>
            </CollapsibleTrigger>
          </UCardGroupItemDescription>
          <USkeleton v-else class="rounded-sm h-1em w-1/3" />
        </UCardGroupItemHeader>
      </div>

      <CollapsibleContent class="ps-14 bg-transparent w-full">
        <ul v-if="targetDetails" class="text-sm pt-2 gap-x-2 grid grid-cols-[auto_1fr] *:(flex flex-col gap-1)">
          <div class="text-muted-foreground">
            <span v-for="key in objectKeys(targetDetails)" :key>
              {{ keyNameMap[key] }}
            </span>
          </div>

          <div>
            <template v-for="[key, value] in objectEntries(targetDetails)" :key="value">
              <UClickToCopy as-child side="right" class="text-xs">
                <UButton variant="link">
                  <template v-if="key === 'last_seen_ts'">
                    <NuxtTime v-if="value" v-bind="PROPS__NUXT_TIME_FULL" :datetime="value" />
                    <span v-else class="text-muted-foreground font-normal italic"> (unknown)</span>
                  </template>

                  <span v-else>{{ value }}</span>
                </UButton>
              </UClickToCopy>
            </template>
          </div>
        </ul>
      </CollapsibleContent>
    </UCardGroupItem>
  </CollapsibleRoot>
</template>
