<script lang="ts" setup>
import type { MatrixAvatarProps } from './avatar.vue'

export interface MatrixRoomAvatarProps extends Omit<MatrixAvatarProps, 'alt' | 'src'> {
  room: MaybeRoomOrId | undefined | null
  direct?: boolean
}

const props = defineProps<MatrixRoomAvatarProps>()
const { client } = useMatrixClient()
const room = useRoom(() => props.room ?? undefined)

const src = computed(() => {
  if (!room.value) return undefined

  return props.direct || isDirectRoom(client.value, room.value)
    ? getDirectRoomAvatarUrl({ client: client.value, mxc: true, room: room.value })
    : (room.value.getMxcAvatarUrl() ?? undefined)
})

const alt = computed(() => (room.value ? resolveRoomName(room.value) : 'Room'))

const delegated = reactiveOmit(props, ['room', 'direct'])
</script>

<template>
  <MatrixAvatar v-bind="delegated" :alt :src data-slot="room-avatar" />
</template>
