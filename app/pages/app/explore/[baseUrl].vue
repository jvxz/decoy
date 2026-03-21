<script lang="ts" setup>
definePageMeta({
  middleware: ['explore'],
  name: 'explore',
})

const route = useRoute()
const baseUrl = computed({
  get: () => {
    if (typeof route.params.baseUrl === 'string')
      return route.params.baseUrl

    return route.params.baseUrl?.[0]
  },
  set: value => navigateTo({
    name: 'explore',
    params: { baseUrl: value },
  }),
})

const { getPublicRooms } = usePublicRooms(baseUrl)
const { data: publicRooms, error, pending } = getPublicRooms({ lazy: true })

const servers = useLocalStorage('explore:servers', () => ['matrix.org', 'mozilla.org', 'unredacted.org'])

const params = useUrlSearchParams<{ q: string }>('history', {
  removeFalsyValues: true,
})
</script>

<template>
  <NuxtLayout name="app">
    <template #aside>
      <div class="p-1 flex flex-col gap-1">
        <UToggleGroupRoot
          v-model="baseUrl"
          class="flex flex-col gap-1 w-full"
          required
        >
          <UToggleGroupItem
            v-for="server in servers"
            :key="server"
            :value="server"
            class="text-base px-4 text-left h-12 w-full justify-start"
          >
            {{ server }}
          </UToggleGroupItem>
        </UToggleGroupRoot>
        <UDialogRoot>
          <UDialogTrigger as-child>
            <UButton
              variant="soft"
              class="text-base px-4 h-12 w-full justify-start"
            >
              <Icon name="mingcute:add-line" class="" />
              Add server
            </UButton>
          </UDialogTrigger>
          <UDialogContent>
            <p>Hello</p>
          </UDialogContent>
        </UDialogRoot>
      </div>
    </template>

    <template #header>
      <div class="px-6 grid grid-cols-2 h-full items-center">
        <div class="flex gap-2 items-center">
          <Icon name="mingcute:server-2-line" />
          <p>{{ baseUrl }}</p>
          <LazyUSpinner v-if="pending" class="size-4" />
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
