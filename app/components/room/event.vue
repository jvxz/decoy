<script lang="ts" setup>
import type { EventType } from 'matrix-js-sdk'
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { injectEventListItemContext } from './event/generic.vue'

export type RoomEventProps = PrimitiveProps & {
  class?: HTMLAttributes['class']
  eventType: EventType | string
  side?: string
}

withDefaults(defineProps<RoomEventProps>(), {
  as: 'div',
})

const { event, grouped, room } = injectEventListItemContext()
</script>

<template>
  <UContextMenuRegionTrigger
    v-if="event && room"
    v-bind="$props"
    region="event"
    :value="{
      event,
      roomId: resolveRoomId(room),
    }"
    data-testid="event-root"
    :data-event-id="event.getId()"
    data-event
    :data-event-type="eventType"
    :class="
      cn(
        'px-6 data-[grouped=false]:mt-4.5 context-menu-open:bg-hover group hover:bg-hover data-[popover-open]:bg-hover shrink-0 data-[grouped=true]:min-h-0',
        $props.class,
      )
    "
    :data-grouped="grouped"
    data-slot="room-event"
  >
    <slot />
  </UContextMenuRegionTrigger>
</template>
