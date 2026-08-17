<script lang="ts" setup>
import { injectEventListItemContext } from '../generic.vue'

const { event, room } = injectEventListItemContext()

const { reactions } = useRoomEventReactions.provide(room, event)
</script>

<template>
  <div v-if="reactions" class="flex flex-row gap-1">
    <UTooltipProvider :delay-duration="700">
      <RoomEventMessageReactionsItem v-for="reaction in reactions.keys()" :key="reaction" :reaction />
    </UTooltipProvider>
  </div>
</template>
