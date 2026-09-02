<script lang="ts" setup>
const { self } = useSelf()
const status = useMatrixStatus()
</script>

<template>
  <UProfilePopoverTrigger
    :user="self ?? undefined"
    :content-props="{
      sideOffset: 14,
      alignOffset: -8,
      side: 'top',
      align: 'start',
    }"
    as-child
  >
    <button
      class="group text-foreground ps-1 rounded-sm flex flex-1 shrink-0 gap-1 h-11 w-full cursor-pointer duration-150 items-center -mx-1.5 hover:bg-white/7.5"
    >
      <div class="p-1 shrink-0 h-11 aspect-square">
        <MatrixAvatar
          :is-loading="!status.isDataSynced"
          loading="eager"
          fetchpriority="high"
          :user="self"
          class="size-full"
        />
      </div>

      <div class="flex-col size-full translate-y-0.5 justify-between *:shrink-0">
        <p v-if="status.isDataSynced && self" class="text-sm font-medium h-1lh w-fit self-start">
          {{ resolveUserName(self) }}
        </p>
        <USkeleton v-else class="text-sm shrink h-1lh w-24" />

        <div class="h-4 w-full relative overflow-hidden *:duration-150 *:ease">
          <p
            class="text-2xs text-muted-foreground bottom-0 absolute group-data-[popover-open]:bottom-1lh group-hover:bottom-1lh"
          >
            {{ self?.presence ? upperFirst(self?.presence) : 'Offline' }}
          </p>
          <p class="text-2xs text-muted-foreground top-1lh absolute group-data-[popover-open]:top-0 group-hover:top-0">
            {{ self?.userId }}
          </p>
        </div>
      </div>
    </button>
  </UProfilePopoverTrigger>
</template>
