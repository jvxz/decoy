<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  defaultOpen?: boolean
  title: string
  roomCount?: number
  memberCount?: number
  description?: string
  avatar?: string
  avatarPlaceholder?: boolean
}>()

const openModel = defineModel<boolean>('open', { default: false })
if (props.defaultOpen) openModel.value = props.defaultOpen

const resolvedAvatar = useResolveAvatarUrl(() => props.avatar)
</script>

<template>
  <UCollapsibleRoot v-model:open="openModel" class="gap-0" :default-open>
    <UCollapsibleTrigger :class="title !== 'Rooms' && 'h-12'">
      <UCollapsibleTriggerIcon />

      <MatrixAvatar
        v-if="isDefined(avatar) || avatarPlaceholder"
        :src="resolvedAvatar"
        :alt="title"
        square
        class="rounded-sm shrink-0 h-full w-fit aspect-square object-contain"
      />

      <div class="flex flex-col gap-1 h-full items-start justify-around">
        <p class="text-clip">
          {{ title }}
        </p>
        <div
          v-if="isDefined(roomCount) || isDefined(memberCount) || description"
          class="text-xs text-muted-foreground font-normal flex gap-1 w-full items-center"
        >
          <span v-if="isDefined(roomCount)" class="shrink-0 text-clip"> {{ roomCount }} rooms </span>

          <template v-if="isDefined(memberCount)">
            <UInlineSeparator />
            <span class="shrink-0 text-clip"> {{ memberCount }} members </span>
          </template>

          <template v-if="description">
            <UInlineSeparator />
            <span class="truncate">
              {{ description }}
            </span>
          </template>
        </div>
      </div>
    </UCollapsibleTrigger>
    <UCollapsibleContent class="pl-2.5 pt-2 flex flex-row gap-0">
      <button
        type="button"
        class="group flex shrink-0 w-4 cursor-pointer items-center justify-center"
        @click="openModel = !openModel"
      >
        <div class="rounded-full bg-border h-full w-px group-hover:bg-border-strong" />
      </button>

      <div class="flex flex-col gap-2 w-full">
        <slot :open="openModel" />
      </div>
    </UCollapsibleContent>
  </UCollapsibleRoot>
</template>
