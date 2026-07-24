<script lang="ts" setup>
const { dismissAll, notifications } = useNotifications()

const { sortState } = useSortRegion('notificationsPopover')
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      align="end"
      :class="
        cn(
          popoverContentBase(),
          'z-popover shadow-popover flex flex-col h-96 w-toast p-0',
          'origin-[var(--reka-popper-transform-origin,top_right)]',
          'data-[state=open]:(animate-in fade-in-0 zoom-in-96 ease-snappy)',
          'data-[state=closed]:(animate-out fade-out-0 zoom-out-96 ease-snappy)',
        )
      "
      :side-offset="8"
    >
      <div class="p-1 border-b flex shrink-0 w-full items-center left-px">
        <USortSelect
          v-model:model-value="sortState"
          :ui="{ trigger: 'rounded-l-md', toggle: 'rounded-r-md', content: 'rounded-md' }"
          :side-offset="5"
        />

        <div class="shrink-0 grow" />

        <UTooltipRoot>
          <UTooltipTrigger as-child>
            <span tabindex="-1">
              <UButton
                :disabled="!notifications.length"
                size="icon-sm"
                variant="outline"
                class="rounded-md"
                @click="dismissAll"
              >
                <Icon name="tabler:checks" />
              </UButton>
            </span>
          </UTooltipTrigger>

          <UTooltipContent>
            <span v-if="notifications.length"> Dismiss all </span>
            <span v-else> No notifications to dismiss </span>
          </UTooltipContent>
        </UTooltipRoot>
      </div>

      <UScrollAreaRoot v-if="notifications.length">
        <UScrollAreaViewport>
          <UAlertRoot v-for="notification in notifications" :key="notification.id" variant="ghost">
            <NotificationsContent :notification />
          </UAlertRoot>
        </UScrollAreaViewport>

        <UScrollAreaScrollbars />
      </UScrollAreaRoot>

      <div v-else class="grid size-full place-items-center">
        <UEmptyRoot>
          <UEmptyIcon variant="naked" name="tabler:inbox" size="sm" />

          <UEmptyDescription> You're all caught up </UEmptyDescription>
        </UEmptyRoot>
      </div>
    </PopoverContent>
  </PopoverPortal>
</template>
