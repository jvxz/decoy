<script lang="ts" setup>
import type { DialogRootEmits, DialogRootProps } from 'reka-ui'

import { string } from '@regle/rules'
import { useForwardPropsEmits } from 'reka-ui'

const props = defineProps<
  DialogRootProps & {
    room: MaybeRoomOrId | undefined
  }
>()
const emits = defineEmits<DialogRootEmits>()

const room = useRoom(() => props.room)
const roomName = useRoomComputed(room, r => (r ? resolveRoomName(r) : 'room'))

const { self } = useSelf()
const { r$ } = useRegle(
  {
    reason: '',
    userId: '',
  },
  {
    reason: { string: withMessage(string, 'The reason must be a string') },
    userId: {
      ...regleUserIdDefs,
      disallowSelf: withMessage(e => isString(e) && e !== self.value?.userId, 'You cannot invite yourself'),
    },
  },
)

const inputEl = useTemplateRef('inputEl')

const delegated = reactiveOmit(props, 'open')
const forwarded = useForwardPropsEmits(delegated, emits)
whenever(
  () => props.open,
  () => r$.$reset({ toInitialState: true }),
)

const open = useVModel(props, 'open', emits)

const { invite } = useRoomInviteActions(() => props.room)
const { isPending: isInviting } = invite
const handleInvite = async () => {
  if (r$.$invalid || !r$.userId.$value) return

  await invite.mutateAsync({
    opts: r$.reason.$value
      ? {
          reason: r$.reason.$value,
        }
      : undefined,
    userId: r$.userId.$value,
  })

  open.value = false
}
</script>

<template>
  <UDialogRoot
    v-bind="forwarded"
    :open
    @update:open="
      e => {
        emits('update:open', e)

        if (isInviting) return
        open = e
      }
    "
  >
    <UDialogContent v-if="room" @open-auto-focus.prevent="inputEl?.$el.focus">
      <UDialogHeader :close-disabled="isInviting">
        <UDialogTitle class="truncate"> Invite to "{{ roomName }}" </UDialogTitle>
      </UDialogHeader>

      <form class="flex flex-col gap-2" @submit.prevent="handleInvite">
        <FormInput
          ref="inputEl"
          v-model:model-value="r$.userId.$value"
          :disabled="isInviting"
          disable-pw
          label="User ID"
          :error="r$.userId.$errors"
          placeholder="@alice:matrix.org"
          required
        />

        <FormInput
          v-model:model-value="r$.reason.$value"
          :disabled="isInviting"
          disable-pw
          label="Reason"
          :error="r$.reason.$errors"
          textarea
        />
      </form>

      <UDialogFooter>
        <UDialogClose :disabled="isInviting" variant="ghost"> Close </UDialogClose>
        <UButton :is-loading="isInviting" :disabled="r$.$invalid" @click="handleInvite"> <span>Invite</span> </UButton>
      </UDialogFooter>
    </UDialogContent>
  </UDialogRoot>
</template>
