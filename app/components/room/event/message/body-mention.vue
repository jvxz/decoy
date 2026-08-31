<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  mentionType: MentionType
  value: string
  text?: string
}>()

const { client } = useMatrixClient()
const currentSpaceId = useCurrentSpaceId()
const roomLocationRoute = computed<RouteLocationRaw | undefined>(() => {
  const parsedUrl = parseURL(props.value)
  const roomId = parsedUrl.pathname
  const { via } = parseQuery(parsedUrl.search)

  return getRoomRoute(client.value, roomId, {
    currentSpace: currentSpaceId.value,
    via: toArray(via ?? []),
  })
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
      <span> {{ text ?? value }}</span>
    </NuxtLink>
  </UMention>
</template>
