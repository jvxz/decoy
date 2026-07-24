<script lang="ts" setup>
const { user } = useProfilePopover()
const { data: mutualRooms, error: mutualRoomsError, isPending: isPendingMutualRooms } = useMutualRooms(user)
</script>

<template>
  <div
    class="text-xs px-2 underline-muted-foreground flex gap-1 w-full cursor-pointer items-center -mx-2.5 hover:underline"
  >
    <div class="grid h-1lh w-max">
      <div class="flex shrink-0 col-start-1 row-start-1 items-center">
        <div
          v-for="i in 3"
          :key="i"
          class="border-2 border-surface-raised rounded-full bg-secondary-raised size-4 not-first:-ml-2"
        />
      </div>
    </div>

    <div class="grid h-1lh w-max relative *:col-start-1 *:row-start-1 *:inset-0">
      <Transition :duration="100" name="zoom">
        <div v-if="isPendingMutualRooms" class="flex h-1lh items-center">
          <USkeleton class="h-[1em] w-24" />
        </div>

        <p v-else-if="mutualRoomsError" class="text-muted-foreground w-fit">Unknown mutual rooms</p>

        <p v-else-if="isDefined(mutualRooms)" class="text-muted-foreground w-fit">
          {{ mutualRooms.length }} mutual rooms
        </p>
      </Transition>
    </div>
  </div>
</template>
