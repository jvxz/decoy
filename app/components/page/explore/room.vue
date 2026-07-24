<script lang="ts" setup>
import type { IPublicRoomsChunkRoom } from 'matrix-js-sdk'

const props = defineProps<{
  room: IPublicRoomsChunkRoom | undefined
}>()

const src = useResolveAvatarUrl(() => props.room?.avatar_url)

const isError = useState(`exploreRoomAvatarError:${props.room?.room_id}`, () => false)
</script>

<template>
  <div class="p-0 rounded-lg border-none relative overflow-clip" :class="!room && 'border'">
    <div class="h-full inset-0 absolute">
      <MatrixAvatar
        v-if="room && src && !isError"
        :size="32"
        :alt="room?.name"
        :src
        class="size-full scale-120 object-cover blur-xl -m-px -translate-y-1/3"
        @error="isError = true"
      />
      <div v-else class="border border-border rounded-t-lg border-b-none bg-surface-top size-full"></div>
    </div>

    <UCard
      variant="raised"
      class="mt-2/5 p-4 pt-1/8 border border-t-0 rounded-b-lg rounded-t-0 flex flex-col gap-2 relative z-10 isolate"
    >
      <MatrixAvatar
        v-if="room"
        :src
        class="border-5 border-surface-raised rounded-2xl bg-surface-raised flex size-16 items-center inset-0 left-4 justify-center absolute z-10 overflow-hidden -top-1/8"
        square
      />
      <div
        v-else
        class="border-5 border-surface-raised rounded-2xl bg-surface-raised flex size-16 items-center inset-0 left-4 justify-center absolute z-10 overflow-hidden -top-1/8"
      ></div>

      <h3 :title="room && room.name" class="font-medium h-1lh w-full truncate">
        {{ room && room.name }}
      </h3>

      <RenderMd
        :content="room ? (room?.topic ? room.topic : '(no description)') : ''"
        class="text-sm tracking-normal h-5lh w-full text-pretty line-clamp-5"
      />

      <div class="text-xs text-muted-foreground pt-4 flex gap-2 items-center">
        <Icon v-if="room" name="tabler:user-filled" class="size-1lh" />
        <p class="h-1lh">
          <span v-if="room" class="font-medium tabular-nums">{{ room.num_joined_members }}</span>
          {{ room ? 'members' : '' }}
        </p>
      </div>
    </UCard>
  </div>
</template>
