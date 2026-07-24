<script lang="ts" setup>
const colCounts = [2, 3, 5, 6]
const sizes = [48, 64, 80, 96, 112, 128]

const rows = Array.from({ length: 7 }, () => ({
  header: sample(sizes),
  lines: Array.from({ length: sample(colCounts) }, () =>
    Array.from({ length: sample(colCounts) }, () => sample(sizes)),
  ),
}))
</script>

<template>
  <div class="pb-4.25" data-ignore data-slot="room-paginate-skeleton">
    <div v-for="(row, idx) in rows" :key="idx" class="pb-4.25">
      <div
        class="group px-6 shrink-0 data-[grouped=false]:mt-4.5 context-menu-open:bg-hover data-[popover-open]:bg-hover hover:bg-hover hover:bg-transparent data-[grouped=true]:min-h-0"
      >
        <RoomEventMessageRoot>
          <RoomEventMessageAvatar :user="undefined" ghost />
          <RoomEventMessageContent class="flex flex-col gap-1.5 translate-y-1">
            <template #header>
              <USkeleton
                class="h-4 relative overflow-clip after:bg-white/15 after:size-full after:content-[''] after:absolute"
                :style="{ width: `${row.header}px` }"
              />
            </template>

            <div v-for="(line, idx) in row.lines" :key="idx" class="flex gap-1.5">
              <USkeleton v-for="(size, idx) in line" :key="idx" class="h-4" :style="{ width: `${size}px` }" />
            </div>
          </RoomEventMessageContent>
        </RoomEventMessageRoot>
      </div>
    </div>
  </div>
</template>
