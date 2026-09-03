<script lang="ts">
// module scoped, shared across components
const yesterdayDate = computed(() => Temporal.Now.plainDateISO().subtract({ days: 1 }))
const localTimeZoneId = computed(() => Temporal.Now.timeZoneId())
</script>

<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'

import type { NuxtTimeProps } from '#app'

const props = defineProps<PrimitiveProps & { datetime: number; class?: string }>()

const isOld = computed(() => {
  const eventDate = Temporal.Instant.fromEpochMilliseconds(props.datetime)
    .toZonedDateTimeISO(localTimeZoneId.value)
    .toPlainDate()

  return Temporal.PlainDate.compare(eventDate, yesterdayDate.value) <= 0
})

const nuxtTimeProps = computed<NuxtTimeProps>(() => {
  if (isOld.value) {
    return {
      datetime: props.datetime,
    }
  }

  return {
    datetime: props.datetime,
    hour: 'numeric',
    minute: 'numeric',
  }
})
</script>

<template>
  <UTooltipRegionTrigger
    region="timestamp"
    :value="{ datetime }"
    v-bind="props"
    class="text-xs text-muted-foreground select-none"
  >
    <NuxtTime v-bind="nuxtTimeProps" />
  </UTooltipRegionTrigger>
</template>
