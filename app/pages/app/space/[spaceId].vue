<script lang="ts" setup>
definePageMeta({
  key: 'space',
  layout: 'app',
  middleware: ['space'],
  name: 'space',
})

const currentSpace = useCurrentSpace()
const joinedRooms = useSpaceJoinedRooms(() => currentSpace.value?.roomId)

defineAppLabel({
  label: () => (currentSpace.value ? resolveRoomName(currentSpace.value) : undefined),
})

const currentRoomId = useCurrentRoomId()
const isPaginating = shallowRef(false)
</script>

<template>
  <LayoutAppSlot name="aside-header">
    <LayoutAppAsideHeaderTitle>
      {{ currentSpace?.name }}
    </LayoutAppAsideHeaderTitle>
  </LayoutAppSlot>

  <LayoutAppSlot name="aside">
    <UAsideListRoot>
      <UAsideListButton as-child>
        <NuxtLink
          :to="{
            name: 'space-browse',
            params: {
              spaceId: $route.params.spaceId,
            },
          }"
        >
          <UAsideListButtonIcon icon="tabler:list-search" />
          <span>Browse Rooms</span>
        </NuxtLink>
      </UAsideListButton>
      <UAsideListButton>
        <UAsideListButtonIcon icon="tabler:users" />
        Members
      </UAsideListButton>

      <UAsideListSeparator />

      <template v-if="!isTestMode()">
        <UAsideListButton v-for="room in joinedRooms" :key="room.roomId" as-child>
          <NuxtLink
            :to="{
              name: 'space-room',
              params: {
                spaceId: $route.params.spaceId,
                roomId: room.roomId,
              },
            }"
          >
            <UAsideListButtonIcon icon="tabler:hash" />
            <span>{{ room.name }}</span>
          </NuxtLink>
        </UAsideListButton>
      </template>
      <template v-else>
        <UAsideListButton
          v-for="room in [
            createMockRoom({ id: '250', seedMessages: 250 }).room,
            createMockRoom({ id: '500', seedMessages: 500 }).room,
            createMockRoom({ id: '750', seedMessages: 750 }).room,
          ]"
          :key="room.name"
          :data-testid="`mock-room-${room.roomId}`"
          as-child
        >
          <NuxtLink
            :to="{
              name: 'space-room',
              params: {
                spaceId: $route.params.spaceId,
                roomId: room.roomId,
              },
            }"
          >
            <UAsideListButtonIcon icon="tabler:hash" />
            <span>{{ room.name }}</span>
          </NuxtLink>
        </UAsideListButton>
      </template>
    </UAsideListRoot>
  </LayoutAppSlot>

  <LayoutAppSlot v-if="currentRoomId" name="page-header">
    <!-- <LayoutAppPageHeader class="flex gap-2 items-center">
      {{ currentRoom.name }}
      <DevOnly>
        <USpinner v-if="isPaginating" class="size-4" />
      </DevOnly>
    </LayoutAppPageHeader> -->
  </LayoutAppSlot>

  <RoomInstance :room="currentRoomId" />

  <NuxtPage :is-paginating />
</template>
