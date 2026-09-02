<script lang="ts" setup>
const rooms = useRooms(isSpace)

const { openDialog } = useGlobalDialog()
</script>

<template>
  <aside class="shrink-0 w-20 top-0 sticky isolate">
    <LayoutAppAsideHome />

    <USeparator class="mx-auto mb-[2px] w-1/2!" />
    <UContextMenuRegionRoot name="asideRoom">
      <div class="py-2.5 flex flex-col gap-2.5 items-center">
        <template v-if="rooms">
          <LazyLayoutAppAsideRoom v-for="room in rooms" :key="room.roomId" :room />
        </template>
        <LayoutAppAsidePublicRooms />
      </div>

      <UContextMenuRegionContent v-slot="{ payload }" name="asideRoom">
        <UContextMenuItem v-if="payload" @select="openDialog('leave', { room: payload.room })">
          Leave space
        </UContextMenuItem>
        <UContextMenuItem
          v-if="payload"
          @select="openDialog('avatar', { label: resolveRoomName(payload.room), room: payload.room, type: 'room' })"
        >
          View avatar
        </UContextMenuItem>
      </UContextMenuRegionContent>
    </UContextMenuRegionRoot>

    <div
      aria-hidden="true"
      class="flex w-full pointer-events-none duration-100 items-center absolute z-1 position-anchor-active anchor-bottom anchor-top ease-snappy"
    >
      <div class="rounded-r bg-foreground h-3/4 w-1"></div>
    </div>
  </aside>
</template>
