<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  middleware: ({ params }) => {
    if ('directRoomId' in params && !params.directRoomId) {
      return navigateTo({
        name: 'me',
      })
    }
  },
  name: 'direct-room',
})

const route = useRoute()
const roomId = computed(() => route.params.directRoomId)

const params = useKnownSearchParams()
const { data: summary } = useRoomSummary(roomId, () => toArray(params.value.via ?? ''))

const resolvedName = useRoomComputed(roomId, room =>
  room ? resolveRoomName(room) : summary.value ? summary.value.name : roomId.value,
)

defineAppLabel({ label: resolvedName })
</script>

<template>
  <LayoutAppSlot name="page-header">
    <LayoutAppPageHeader>
      <span> {{ resolvedName }}</span>
    </LayoutAppPageHeader>
  </LayoutAppSlot>

  <RoomInstance :room="route.params.directRoomId" :with-members-list="false" />
</template>
