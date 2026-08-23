<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  mentionType: MentionType
  value: string
  text?: string
}>()

const { client } = useMatrixClient()
const roomLocationRoute = computed<RouteLocationRaw | undefined>(() => {
  if (props.mentionType === 'user') return

  const instance = client.value.getRoom(props.value)
  if (!instance) return

  if (isSpace(instance))
    return {
      name: 'space',
      params: {
        spaceId: instance.roomId,
      },
    }

  const spaceId = getRoomSpaceId(client.value, instance)

  return spaceId
    ? { name: 'space-room', params: { roomId: instance.roomId, spaceId } }
    : { name: 'direct-room', params: { directRoomId: instance.roomId } }
})
</script>

<template>
  <UMention
    :style="{
      'font-size': 'inherit',
    }"
    as-child
  >
    <UProfilePopoverTrigger
      v-if="mentionType === 'user'"
      :content-props="{
        side: 'right',
        align: 'start',
        sideOffset: 4,
        collisionPadding: 12,
      }"
      :user="value"
    >
      <span>
        {{ text ?? value }}
      </span>
    </UProfilePopoverTrigger>

    <NuxtLink v-else :to="roomLocationRoute">
      {{ text ?? value }}
    </NuxtLink>
  </UMention>
</template>
