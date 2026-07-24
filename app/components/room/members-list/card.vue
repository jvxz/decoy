<script lang="ts" setup>
const props = defineProps<{
  userId: string
}>()

const profile = useUserProfile(props.userId)
const creator = useCurrentRoomCreator()

const triggerRef = useTemplateRef('trigger')
onMounted(() => {
  const btn = unrefElement(triggerRef)
  if (btn) {
    // workaround to prevent virtual list from scrolling when closing popover
    const nativeFocus = btn.focus.bind(btn)
    btn.focus = (options?: FocusOptions) => nativeFocus({ ...options, preventScroll: true })
  }
})

const { user: profilePopoverUser } = useProfilePopover()
</script>

<template>
  <UProfilePopoverTrigger
    freeze-reference
    :user="userId"
    :content-props="{
      side: 'left',
      align: 'start',
      collisionPadding: 12,
      sideOffset: 22,
      disableUpdateOnLayoutShift: true,
    }"
    as-child
  >
    <UButton
      ref="trigger"
      class="text-foreground font-normal gap-2 h-10 w-full justify-start"
      variant="ghost"
      :class="`data-[state=open]:${profilePopoverUser?.userId === props.userId ? 'bg-selected' : 'bg-transparent'}`"
    >
      <div class="shrink-0 size-6 [&>svg]:!size-full">
        <MatrixAvatar :user="userId" class="size-full" />
      </div>

      <p :title="profile?.displayname" class="truncate">
        {{ profile?.displayname }}
      </p>

      <UTooltipRoot>
        <UTooltipTrigger as-child>
          <Icon v-if="userId === creator" name="tabler:crown" class="text-primary" />
        </UTooltipTrigger>
        <UTooltipContent> Owner </UTooltipContent>
      </UTooltipRoot>
    </UButton>
  </UProfilePopoverTrigger>
</template>
