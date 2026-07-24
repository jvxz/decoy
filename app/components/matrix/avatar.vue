<script setup lang="ts">
import type { RoomMember } from 'matrix-js-sdk'

import { useForwardPropsEmits } from 'reka-ui'

import type { ImgEmits, ImgProps } from '~/components/img.vue'

export type MatrixAvatarProps = Omit<ImgProps, 'src' | 'alt'> & {
  square?: boolean
  imageSize?: AvatarImageSize
  placeholderKey?: string
  direct?: boolean
  isLoading?: boolean
  room?: MaybeRoomOrId | undefined | null
  user?: MaybeUserOrId | undefined | null
  roomMember?: RoomMember | undefined | null
  src?: string | undefined | null
}

export type MatrixAvatarEmits = ImgEmits

const props = withDefaults(defineProps<MatrixAvatarProps>(), {
  imageSize: 'small',
})
const emits = defineEmits<ImgEmits>()

const room = useRoom(() => props.room ?? undefined)
const userProfile = useUserProfile(() => props.user ?? undefined)

const alt = computed(() => {
  if (props.roomMember) return resolveUserName(props.roomMember)
  if (room.value) return room.value.name ?? room.value.roomId ?? ''
  if (userProfile.value) return userProfile.value.displayname ?? (props.user ? resolveUserId(props.user) : '')

  return ''
})

const { client } = useMatrixClient()
const mxcUrl = computed(() => {
  if (props.roomMember) return props.roomMember.getMxcAvatarUrl()

  if (room.value)
    return room.value
      ? props.direct || isDirectRoom(client.value, room.value)
        ? getDirectRoomAvatarUrl({ client: client.value, mxc: true, room: room.value })
        : (room.value.getMxcAvatarUrl() ?? undefined)
      : undefined

  if (userProfile.value) return userProfile.value.avatar_url

  return undefined
})

const resolvedAvatar = useResolveAvatarUrl(mxcUrl, { size: props.imageSize })

const isSrcError = ref(false)
const isResolvedError = ref(false)
watch(
  () => props.src,
  () => {
    isSrcError.value = false
  },
)
watch(
  () => resolvedAvatar.value,
  () => {
    isResolvedError.value = false
  },
)

const activeSrc = computed(() => {
  if (props.src && !isSrcError.value) return props.src
  if (resolvedAvatar.value && !isResolvedError.value) return resolvedAvatar.value
  return undefined
})

watch(activeSrc, url => emits('url', url), { immediate: true })

const placeholderName = computed(() => {
  if (props.placeholderKey) return props.placeholderKey
  if (props.roomMember) return resolveUserName(props.roomMember)
  if (room.value) return room.value.roomId
  if (props.user) return resolveUserId(props.user)
  if (props.src) return props.src
  return 'UNKNOWN'
})

const delegated = reactiveOmit(props, [
  'room',
  'user',
  'src',
  'square',
  'imageSize',
  'placeholderKey',
  'isLoading',
  'roomMember',
])
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <Slot data-slot="matrix-avatar">
    <Img
      v-if="activeSrc"
      v-bind="forwarded"
      :key="activeSrc"
      :alt
      :src="activeSrc"
      :class="cn('object-cover', !square && 'rounded-full', props.class)"
      :do-placeholder="false"
      @error="activeSrc === props.src ? (isSrcError = true) : (isResolvedError = true)"
    />
    <AvatarPlaceholder
      v-else
      :is-loading
      :name="placeholderName"
      :square
      :class="cn(!square && 'rounded-full', 'size-full', props.class)"
    />
  </Slot>
</template>
