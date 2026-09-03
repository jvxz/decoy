<script lang="ts" setup>
const props = defineProps<{ roomId: string }>()

const roomName = useRoomComputed(
  () => props.roomId,
  room => (room ? resolveRoomName(room) : 'Unknown Room'),
)
</script>

<template>
  <UContextMenuRegionTrigger as-child region="directRoom" :value="{ roomId }">
    <UAsideListButton class="flex gap-3 w-full items-center h-2.25lh!" as-child>
      <NuxtLink
        :to="{
          name: 'direct-room',
          params: {
            directRoomId: roomId,
          },
        }"
      >
        <MatrixRoomAvatar :room="roomId" class="rounded-full size-8" />
        <span class="font-medium">{{ roomName }}</span>
      </NuxtLink>
    </UAsideListButton>
  </UContextMenuRegionTrigger>
</template>
