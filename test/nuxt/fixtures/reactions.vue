<script lang="ts" setup>
import type { MatrixEvent, Room } from 'matrix-js-sdk'

import { provideEventListItemContext } from '~/components/room/event/generic.vue'

const props = defineProps<{ event: MatrixEvent; room: Room }>()

provideEventListItemContext({
  event: toRef(props, 'event'),
  grouped: ref(false),
  room: toRef(props, 'room'),
})
</script>

<template>
  <UTooltipProvider>
    <RoomEventListProviders>
      <RoomEventMessage v-if="event && room" />
    </RoomEventListProviders>
  </UTooltipProvider>
</template>
