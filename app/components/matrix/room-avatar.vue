<script lang="ts" setup>
import type { MatrixAvatarProps } from './avatar.vue'

export interface MatrixRoomAvatarProps extends Omit<MatrixAvatarProps, 'alt' | 'src'> {
  room: MaybeRoomOrId | undefined | null
  direct?: boolean
}

const props = defineProps<MatrixRoomAvatarProps>()
const { client } = useMatrixClient()

const src = useRoomComputed(
  () => props.room ?? undefined,
  r => {
    if (!r) return

    return props.direct || isDirectRoom(client.value, r)
      ? getDirectRoomAvatarUrl({ client: client.value, mxc: true, room: r })
      : (r.getMxcAvatarUrl() ?? undefined)
  },
)

const alt = useRoomComputed(
  () => props.room ?? undefined,
  r => (r ? resolveRoomName(r) : 'Room'),
)

const delegated = reactiveOmit(props, ['room', 'direct'])
</script>

<template>
  <MatrixAvatar v-bind="delegated" :alt :src data-slot="room-avatar" />
</template>
