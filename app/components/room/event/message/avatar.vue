<script lang="ts" setup>
import type { RoomMember } from 'matrix-js-sdk'

defineProps<{
  room?: MaybeRoomOrId | undefined
  member?: RoomMember | string | undefined
  size?: number
  ghost?: boolean
}>()
</script>

<template>
  <div :class="cn('shrink-0 size-10 group-data-[grouped=true]:h-0 mt-0.5 data-[grouped=true]:m-0', $attrs.class)">
    <MatrixRoomMemberAvatar v-if="!ghost && member" :room :member :size="size ?? 32" class="size-full cursor-pointer" />
    <USkeleton v-else class="rounded-full size-full" />
  </div>
</template>
