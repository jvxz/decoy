<script lang="ts" setup>
const { getPublicRooms } = useMatrix()

const { data: publicRooms, error } = getPublicRooms({
  lazy: true,
})
</script>

<template>
  <template v-if="!error && publicRooms">
    <div class="page-top-padding mx-auto flex flex-col gap-4 max-w-screen-xl">
      <h1 class="text-xl font-medium">
        Public Rooms
      </h1>

      <div class="gap-4 grid grid-cols-4">
        <div
          v-for="room in publicRooms.chunk"
          :key="room.room_id"
          class="border rounded-lg w-full relative overflow-hidden"
        >
          <div class="bg-primary h-1/3 inset-0 absolute" />

          <div class="p-4 pt-1/5 bg-card flex flex-col gap-2">
            <AvatarRoot class="border border-4 border-card rounded-2xl bg-card flex size-16 items-center justify-center z-10 overflow-hidden">
              <AvatarImage
                v-if="room.avatar_url"
                :src="mxcToHttps(room.avatar_url, {
                  width: 32,
                  height: 32,
                  resizeMethod: 'scale',
                  allowRedirects: true,
                  allowDirectLinks: false,
                  useAuthentication: false,
                }) ?? ''"
              />
              <AvatarFallback class="text-sm text-foreground font-medium">
                {{ room.name ? room.name.slice(0, 2) : room.room_id.slice(0, 2) }}
              </AvatarFallback>
            </AvatarRoot>

            <h3 :title="room.name" class="font-medium w-full truncate">
              {{ room.name }}
            </h3>

            <p v-if="room.topic" class="text-sm text-muted-foreground tracking-normal h-5lh w-full text-pretty line-clamp-5">
              {{ room.topic }}
            </p>
            <p v-else class="text-sm text-muted-foreground opacity-50 min-h-5lh w-full text-pretty line-clamp-5">
              (no description)
            </p>

            <div class="text-xs text-muted-foreground pt-4 flex gap-2 items-center">
              <Icon name="mingcute:user-2-fill" class="size-1lh" />
              <p>
                <span class="font-medium tabular-nums">{{ $n(room.num_joined_members) }}</span> members
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
