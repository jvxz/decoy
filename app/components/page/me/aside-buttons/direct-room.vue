<script lang="ts" setup>
const props = defineProps<{ roomId: string }>()

const room = useRoom(() => props.roomId)
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
        <MatrixRoomAvatar :room class="rounded-full size-8" />
        <span class="font-medium">{{ room ? resolveRoomName(room) : 'Unknown Room' }}</span>
      </NuxtLink>
    </UAsideListButton>
  </UContextMenuRegionTrigger>
</template>
