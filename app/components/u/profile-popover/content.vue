<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

import { KnownMembership } from 'matrix-js-sdk'

defineProps<{ class?: HTMLAttributes['class'] }>()
const { contentProps, manualRoom, open, referenceElement, user } = useProfilePopover()

const { self } = useSelf()

const currentRoom = useCurrentRoom()
const room = computed(() => manualRoom.value ?? currentRoom.value)

const userId = computed(() => user.value?.userId)

const roomMember = useRoomMember(room, userId)
const displayName = computed(() =>
  roomMember.value ? resolveUserName(roomMember.value) : getDisplayNameFallback(user.value?.userId),
)
const avatarUrl = computed(() => resolveAvatarUrl(roomMember.value?.getMxcAvatarUrl(), { size: 'small' }))
const parsedUserId = computed(() => parseUserId(roomMember.value?.userId))

const membership = useRoomMembership(room, userId)
const powerLevel = useRoomMemberPowerLevel(room, userId)
const powerLevelName = computed(() => upperFirst(getPowerLevelName(powerLevel.value)))

const isSelf = computed(() => self.value?.userId === user.value?.userId)

const { copy } = useClipboard()
const { openDialog } = useGlobalDialog()
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="contentProps"
      as-child
      data-slot="profile-popover"
      disable-outside-pointer-events
      :reference="referenceElement ?? undefined"
      :class="cn('z-popover', $props.class)"
    >
      <UCard
        class="p-0 border-none bg-popover gap-0 w-74 shadow-popover transition-transform duration-100 relative overflow-clip animate-in animate-ease-out data-[state=open]:slide-in-from-r-3"
      >
        <div class="rounded-t shrink-0 h-24 inset-0 absolute overflow-clip isolate">
          <div class="rounded-t flex h-full justify-end relative">
            <MatrixAvatar
              v-if="avatarUrl"
              :user
              class="rounded-t size-full scale-150 absolute object-cover blur-xl -z-1"
            />

            <div
              v-else
              class="border border-b-0 border-border-strong rounded-t bg-surface-top size-full absolute -z-1"
            />

            <UProfilePopoverContentButtons :user-id="user?.userId" />
          </div>
        </div>

        <div class="px-4 pb-4 pt-14 border border-border-strong rounded flex flex-1 flex-col gap-2">
          <button
            class="group rounded-full size-20 relative"
            @click="
              () => {
                const payload = { user, label: displayName }
                open = false
                nextTick(() => openDialog('avatar', payload))
              }
            "
          >
            <MatrixAvatar :user class="size-20 ring-6 ring-popover" image-size="small" />
            <div
              class="rounded-full size-20 cursor-pointer content-[''] inset-0 absolute z-2 group-hover:bg-hover/25"
            />
          </button>

          <div class="flex flex-col">
            <p class="text-lg font-medium">
              {{ displayName }}
            </p>

            <div class="flex items-center">
              <p class="text-xs underline-offset-4">
                {{ `@${parsedUserId.name}` }}
              </p>

              <UDropdownMenuRoot>
                <UDropdownMenuTrigger as-child>
                  <UButton
                    variant="link"
                    class="text-xs text-muted-foreground font-normal no-underline data-[state=open]:underline hover:underline"
                  >
                    {{ `:${parsedUserId.homeserver}` }}
                  </UButton>
                </UDropdownMenuTrigger>
                <UDropdownMenuContent side="right" align="start">
                  <UDropdownMenuItem as-child>
                    <NuxtLink
                      :to="{
                        name: 'explore',
                        params: { baseUrl: parsedUserId.homeserver },
                      }"
                      @click="open = false"
                    >
                      Explore rooms
                    </NuxtLink>
                  </UDropdownMenuItem>
                  <UDropdownMenuItem @click="copy(parsedUserId.homeserver)"> Copy URL </UDropdownMenuItem>
                </UDropdownMenuContent>
              </UDropdownMenuRoot>
            </div>
          </div>

          <UProfilePopoverMutualRooms v-if="!isSelf" />

          <div
            v-if="isDefined(membership) && membership === KnownMembership.Join"
            class="flex flex-wrap gap-1 *:text-xs *:font-normal *:rounded-full *:max-w-28 *:block *:truncate"
          >
            <UBadge class="" variant="outline">
              {{ powerLevelName }}
            </UBadge>
          </div>

          <UInput
            v-if="!isSelf"
            :placeholder="`Message ${displayName}`"
            :classes="{ input: 'text-xs bg-transparent' }"
          />
        </div>
      </UCard>
    </PopoverContent>
  </PopoverPortal>
</template>
