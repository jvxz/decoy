<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'

import { useForwardProps } from 'reka-ui'

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      room?: MaybeRoomOrId | undefined
      withAvatar?: boolean
      manualAvatarSrc?: string | undefined
      class?: string
      alwaysShowAvatar?: boolean
      dynamicStyles?: boolean
    }
  >(),
  {
    dynamicStyles: false,
    withAvatar: true,
  },
)

const room = useRoom(() => props.room)

const avatarProps = computed(() => ({
  alt: props.room ? (isRoomId(props.room) ? props.room : props.room.name) : 'Room',
  class: 'rounded-sm shrink-0 w-fit aspect-square',
  square: true,
}))

const isJoined = useRoomIsJoined(room)

const isDirectInvite = useIsDirectInvite(room)

const delegated = reactiveOmit(props, 'class', 'room', 'withAvatar', 'manualAvatarSrc')
const forwarded = useForwardProps(delegated)
</script>

<template>
  <UCard
    v-bind="forwarded"
    variant="raised"
    :class="
      cn(
        'w-full relative h-18 p-3.5 border flex-row gap-3.5',
        dynamicStyles &&
          'hover:(border-border-strong bg-hover) data-[context-menu-open]:(border-border-strong bg-hover)',
        props.class,
      )
    "
  >
    <template v-if="withAvatar">
      <Img v-if="manualAvatarSrc" v-bind="avatarProps" :src="manualAvatarSrc" />
      <MatrixRoomAvatar
        v-else-if="isJoined || isDirectInvite || alwaysShowAvatar"
        :room
        :direct="isDirectInvite"
        v-bind="avatarProps"
      />
      <div v-else class="border border-border-strong rounded-sm border-dashed shrink-0 w-fit aspect-square" />
    </template>
    <slot :room />
  </UCard>
</template>
