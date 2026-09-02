<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{ payload: ContextMenuRegions['homeRoom']['room'] }>()

const to = computed<RouteLocationRaw>(() =>
  props.payload.kind === 'group'
    ? {
        name: 'space-room',
        params: {
          roomId: props.payload.roomId,
          spaceId: props.payload.spaceId,
        },
      }
    : {
        name: 'direct-room',
        params: {
          directRoomId: props.payload.roomId,
        },
      },
)

const roomId = computed(() => props.payload.roomId)

const isJoined = useRoomIsJoined(roomId)
const roomName = useRoomComputed(roomId, r => (r ? resolveRoomName(r) : 'Unknown room'))
const memberCount = useRoomMemberCount(roomId)
const roomTopic = useRoomTopic(roomId)
</script>

<template>
  <NuxtLink class="group" :to>
    <URoomShowcaseCardRoot
      :room="payload.roomId"
      dynamic-styles
      class="cursor-pointer group-data-[context-menu-open]:(border-border-strong bg-hover)"
    >
      <URoomShowcaseCardContent>
        <URoomShowcaseCardHeader>
          <URoomShowcaseCardTitle
            class="flex items-center"
            :class="{
              'text-muted-foreground': !isJoined,
            }"
          >
            <span>{{ roomName }}</span>
          </URoomShowcaseCardTitle>

          <URoomShowcaseCardDescription>
            <template v-if="isJoined">
              <span>{{ memberCount ?? 0 }} {{ handlePlural(memberCount ?? 0, 'members', 'member') }}</span>
              <template v-if="roomTopic">
                <UInlineSeparator />
                <span> {{ roomTopic }}</span>
              </template>
            </template>

            <span v-else class="italic">Not joined</span>
          </URoomShowcaseCardDescription>
        </URoomShowcaseCardHeader>
      </URoomShowcaseCardContent>
    </URoomShowcaseCardRoot>
  </NuxtLink>
</template>
