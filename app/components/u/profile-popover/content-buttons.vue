<script lang="ts" setup>
const props = defineProps<{ userId: string | undefined }>()

const { context, open } = useProfilePopover()

const { self } = useSelf()

const { openDialog } = useGlobalDialog()
const user = useUser(() => props.userId)

const { copy, isSupported } = useClipboard()
const copied = refAutoReset(false, 750)

function viewAvatar() {
  if (!props.userId) return

  const payload = { label: resolveUserName(user.value ?? props.userId), type: 'user', user: props.userId } as const

  open.value = false
  openDialog('avatar', payload)
}

function handleCopyUserId() {
  if (!isSupported.value || !props.userId) return

  copy(props.userId).then(() => (copied.value = true))
}
</script>

<template>
  <div class="p-2 space-x-1">
    <UButton
      v-if="context?.from !== 'direct' && userId !== self?.userId"
      size="icon"
      variant="soft"
      class="rounded-full border-none"
    >
      <Icon name="tabler:message" />
    </UButton>
    <UDropdownMenuRoot>
      <UDropdownMenuTrigger as-child>
        <UButton size="icon" variant="soft" class="rounded-full border-none bg-popover">
          <Icon name="tabler:dots" />
        </UButton>
      </UDropdownMenuTrigger>
      <UDropdownMenuContent>
        <UDropdownMenuItem :disabled="!isSupported || !props.userId" @click="handleCopyUserId">
          <Icon name="tabler:tag" /> Copy ID
        </UDropdownMenuItem>
        <UDropdownMenuItem
          @click="viewAvatar"
        >
          <Icon name="tabler:photo" /> View avatar</UDropdownMenuItem
        >
      </UDropdownMenuContent>
    </UDropdownMenuRoot>
  </div>
</template>
