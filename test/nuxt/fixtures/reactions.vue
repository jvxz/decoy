<script lang="ts" setup>
import type { MatrixEvent, Room } from 'matrix-js-sdk'

defineProps<{ event: MatrixEvent; room: Room }>()
</script>

<template>
  <UTooltipProvider>
    <RoomEventListProviders>
      <RoomEventMessage v-if="event && room" :room :event :grouped="false" />
    </RoomEventListProviders>
  </UTooltipProvider>
</template>
