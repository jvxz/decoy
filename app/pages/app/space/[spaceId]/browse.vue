<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  name: 'space-browse',
})

const currentSpaceId = useCurrentSpaceId()
const currentSpace = useCurrentSpace()
const { conversationRooms, isLoading, isSuccess, subspaces, suggestedRooms } = useSpaceHierarchy(currentSpaceId, true)

const conversationCachedCount = useCachedCount(
  () => `${currentSpaceId.value}-conversations`,
  () => (isSuccess.value ? Math.min(50, conversationRooms.value.size) : undefined),
  6,
)
const subspaceCachedCount = useCachedCount(
  () => `${currentSpaceId.value}-subspaces`,
  () => (isSuccess.value ? Math.min(24, subspaces.value.size) : undefined),
  4,
)

const scrollEl = useTemplateRef('scrollEl')
provideIntersectionObserver(scrollEl)
</script>

<template>
  <LayoutAppSlot name="page-header">
    <LayoutAppPageHeader class="flex gap-2 items-center">
      <Icon name="tabler:home" />
      <span>Home</span>
    </LayoutAppPageHeader>
  </LayoutAppSlot>

  <div ref="scrollEl" class="py-page-y-padding h-full overflow-y-scroll scrollbar-gutter-stable">
    <UShowcaseRoot>
      <PageRoomBrowseHeader :space="currentSpace" :is-loading />

      <UShowcaseSeparator />

      <UShowcaseContent>
        <!-- conversations -->
        <PageRoomBrowseSection title="Rooms" :default-open="true" class="h-fit">
          <template v-if="!isLoading">
            <VisibleLazy v-for="room in conversationRooms.values()" :key="room.room_id" :height="72" use-injection>
              <PageRoomBrowseCard :room :suggested="suggestedRooms.has(room.room_id)" />
            </VisibleLazy>
          </template>

          <!-- conversation skeletons -->
          <template v-else>
            <VisibleLazy v-for="i in conversationCachedCount" :key="i" :height="72" use-injection>
              <USkeleton class="h-18 w-full" />
            </VisibleLazy>
          </template>
        </PageRoomBrowseSection>

        <!-- subspaces -->
        <template v-if="!isLoading">
          <PageRoomBrowseSection
            v-for="space in subspaces.values()"
            :key="space.room_id"
            v-slot="{ open }"
            :title="space.name ?? space.room_id"
            :avatar="space.avatar_url"
            :description="space.topic"
            :room-count="space.roomCount"
            :member-count="space.num_joined_members"
            avatar-placeholder
          >
            <PageRoomBrowseSubspace :space="space" :open :count="space.roomCount" />
          </PageRoomBrowseSection>
        </template>

        <!-- subspace skeletons -->
        <template v-else>
          <USkeleton v-for="key in subspaceCachedCount" :key class="h-12" />
        </template>
      </UShowcaseContent>
    </UShowcaseRoot>
  </div>
</template>
