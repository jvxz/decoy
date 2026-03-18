<script lang="ts" setup>
definePageMeta({
  middleware: ['explore'],
  name: 'explore',
})

const route = useRoute()

const baseUrl = computed(() => {
  if (typeof route.params.baseUrl === 'string')
    return route.params.baseUrl

  return route.params.baseUrl?.[0]
})

const { getPublicRooms } = useMatrix(baseUrl)
const { data: publicRooms, error, pending } = getPublicRooms({
  lazy: true,
})

const params = useUrlSearchParams<{ q: string }>('history', {
  removeFalsyValues: true,
})
</script>

<template>
  <NuxtLayout name="app">
    <template #aside>
    </template>

    <template #header>
      <div class="px-6 grid grid-cols-3 h-full items-center">
        <div class="flex gap-2 items-center">
          <Icon name="mingcute:server-2-line" />
          <p>{{ baseUrl }}</p>
          <USpinner v-if="pending" class="size-4" />
        </div>

        <div class="text-sm text-muted-foreground mx-auto flex gap-2 items-center">
          <Icon name="mingcute:information-line" class="h-1lh" />
          <p>Some rooms may hide images to guests</p>
        </div>

        <div class="ml-auto">
          <UInput
            v-model="params.q"
            class="w-64"
            placeholder="Search"
            leading-icon="mingcute:search-line"
          />
        </div>
      </div>
    </template>

    <div
      class="py-page-y-padding h-full scrollbar-gutter-stable"
      :class="publicRooms ? 'overflow-y-auto' : 'overflow-y-hidden'"
    >
      <div class="mx-auto container gap-4 grid grid-cols-4 max-w-screen-xl">
        <template v-if="!error && publicRooms">
          <PageExploreRoom
            v-for="room in publicRooms.chunk"
            :key="room.room_id"
            :room="room"
          />
        </template>
        <template v-else-if="!error && !publicRooms">
          <PageExploreRoom
            v-for="(_, i) in Array.from({ length: 16 })"
            :key="i"
            :room="undefined"
          />
        </template>
      </div>
    </div>
  </NuxtLayout>
</template>
