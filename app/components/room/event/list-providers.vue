<template>
  <UTooltipRegionRoot :delay-duration="500" name="timestamp">
    <UContextMenuRegionRoot name="event">
      <UContextMenuRegionRoot name="member">
        <slot />

        <!-- member ctx menu -->
        <UContextMenuRegionContent v-slot="{ payload }" name="member">
          <RoomContextMenuMember v-if="payload" v-bind="payload" />
        </UContextMenuRegionContent>
      </UContextMenuRegionRoot>

      <!-- event ctx menu -->
      <UContextMenuRegionContent v-slot="{ payload }" name="event">
        <RoomContextMenuEvent v-if="payload" v-bind="payload" />
      </UContextMenuRegionContent>
    </UContextMenuRegionRoot>

    <!-- timestamp tooltip -->
    <UTooltipRegionContent v-slot="{ payload }" name="timestamp">
      <NuxtTime v-if="payload" :datetime="payload?.datetime" v-bind="PROPS__NUXT_TIME_FULL" />
    </UTooltipRegionContent>
  </UTooltipRegionRoot>
</template>
