<script lang="ts" setup>
import { Preset, Visibility } from 'matrix-js-sdk'

const open = shallowRef(false)

const { r$ } = useRegle(
  { encrypt: false, userId: '' },
  {
    userId: regleUserIdDefs,
  },
)

whenever(() => open.value, r$.$reset)

const { createRoom } = useClientActions()
const { addRoomToDirectList } = useDirectRooms()
const { executeImmediate: handleCreate, isLoading: isCreating } = useAsyncState(async () => {
  r$.$touch()

  const { valid } = await r$.$validate()
  if (!valid) return

  const { userId } = r$.$value

  const { room_id } = await createRoom.mutateAsync({
    initial_state: r$.encrypt.$value ? [MATRIX.ROOM.INITIAL_STATE.ENCRYPTION] : undefined,
    invite: [userId],
    is_direct: true,
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
  })

  open.value = false

  await addRoomToDirectList(room_id, userId)

  return navigateTo({
    name: 'direct-room',
    params: {
      directRoomId: room_id,
    },
  })
}, undefined)

const inputEl = useTemplateRef('inputEl')
</script>

<template>
  <UDialogRoot
    :open
    @update:open="
      e => {
        if (isCreating) return
        open = e
      }
    "
  >
    <UTooltipRoot>
      <UDialogTrigger as-child>
        <UTooltipTrigger as-child>
          <button class="text-muted-foreground flex cursor-pointer items-center justify-center">
            <Icon name="tabler:plus" />
          </button>
        </UTooltipTrigger>
      </UDialogTrigger>
      <UTooltipContent> Create chat </UTooltipContent>
    </UTooltipRoot>

    <UDialogContent @open-auto-focus.prevent="inputEl?.$el.focus()">
      <UDialogHeader :close-disabled="isCreating">
        <UDialogTitle> Create chat </UDialogTitle>
        <UDialogDescription> Enter a user's ID to create a chat with them </UDialogDescription>
      </UDialogHeader>

      <form class="flex flex-col gap-2" @submit.prevent="handleCreate">
        <FormInput
          ref="inputEl"
          v-model="r$.userId.$value"
          :disabled="isCreating"
          label="User ID"
          placeholder="@alice:matrix.org"
          :error="r$.userId.$errors"
          disable-pw
          required
        />

        <UCheckboxCardRoot v-model:model-value="r$.encrypt.$value" :disabled="isCreating" class="w-full">
          <UCheckboxCardIcon name="tabler:lock" />
          <UCheckboxCardContent>
            <UCheckboxCardTitle> Encrypt room </UCheckboxCardTitle>
            <UCheckboxCardDescription>
              Enable end-to-end encryption for this room.
              <span class="font-medium underline">Once the room is created, this cannot be changed.</span>
            </UCheckboxCardDescription>
          </UCheckboxCardContent>

          <UCheckboxCardInput />
        </UCheckboxCardRoot>
      </form>

      <UDialogFooter>
        <UDialogClose :disabled="isCreating" variant="ghost"> Cancel </UDialogClose>
        <UButton :disabled="r$.$invalid" :is-loading="isCreating" @click="handleCreate">
          <span>Create</span>
        </UButton>
      </UDialogFooter>
    </UDialogContent>
  </UDialogRoot>
</template>
