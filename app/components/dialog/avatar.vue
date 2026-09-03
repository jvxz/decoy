<script lang="ts" setup>
import type { RoomMember } from 'matrix-js-sdk'
import type { DialogRootProps } from 'reka-ui'

// widened from GlobalDialogMap['avatar']: defineProps merges union branches but keeps a
// branch-only key required, so declaring the union directly warns on every other variant
export type AvatarDialogProps = DialogRootProps & {
  label: string
  type: 'room' | 'user' | 'roomMember'
  room?: MaybeRoomOrId
  user?: MaybeUserOrId
  member?: RoomMember | string
}

const props = withDefaults(defineProps<AvatarDialogProps>(), { modal: true })

const open = defineModel<boolean>('open')

const delegated = reactiveOmit(props, ['label', 'type', 'room', 'user', 'member'])
const isError = ref(false)
const imageUrl = ref<string>()

const shared = {
  class: 'rounded w-full',
  imageSize: 'full',
  onError: () => (isError.value = true),
  onUrl: (url: string | undefined) => (imageUrl.value = url),
  square: true,
} as const

const resolvedId = computed(() => {
  if (props.type === 'room') return props.room && resolveRoomId(props.room)
  if (props.type === 'user') return props.user && resolveUserId(props.user)
  if (!props.member) return undefined

  return isString(props.member) ? props.member : props.member.userId
})

const saveAvatarImage = () => {
  if (!imageUrl.value) return

  saveAsImage(imageUrl.value, resolvedId.value ? `${resolvedId.value}-avatar` : createGenericFilename())
}
</script>

<template>
  <UDialogRoot v-bind="delegated" v-model:open="open">
    <UDialogContent>
      <UDialogHeader>
        <UDialogTitle> {{ label }} </UDialogTitle>
        <VisuallyHidden>
          <UDialogDescription> {{ label }}'s avatar </UDialogDescription>
        </VisuallyHidden>
      </UDialogHeader>

      <MatrixRoomAvatar v-if="type === 'room' && room" v-bind="shared" :room />
      <MatrixUserAvatar v-else-if="type === 'user' && user" v-bind="shared" :user />
      <MatrixRoomMemberAvatar v-else-if="room && member" v-bind="shared" :room :member />

      <UDialogFooter>
        <UDialogAnnotation v-if="isError" class="text-danger"> Failed to load avatar </UDialogAnnotation>
        <div class="grow" />
        <UButton :disabled="isError" @click="saveAvatarImage"> Save avatar </UButton>
      </UDialogFooter>
    </UDialogContent>
  </UDialogRoot>
</template>
