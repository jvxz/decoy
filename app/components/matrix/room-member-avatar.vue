<script lang="ts" setup>
import type { RoomMember } from 'matrix-js-sdk'

import type { MatrixAvatarProps } from './avatar.vue'

export interface RoomMemberAvatarProps extends Omit<MatrixAvatarProps, 'alt' | 'src'> {
  room: MaybeRoomOrId | undefined | null
  member: RoomMember | string
}

const props = defineProps<RoomMemberAvatarProps>()
const roomMember = useRoomMember(
  () => props.room ?? undefined,
  () => (isString(props.member) ? props.member : props.member.userId),
)

const alt = computed(() => resolveUserName(roomMember.value))

const delegated = reactiveOmit(props, ['room', 'member'])
</script>

<template>
  <MatrixAvatar v-bind="delegated" :alt :src="roomMember?.getMxcAvatarUrl()" data-slot="room-member-avatar" />
</template>
