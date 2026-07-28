<script lang="ts" setup>
const { open, searchQuery, tab } = useSettingsDialog()

onUnmounted(() => {
  tab.value = SETTINGS_DEFAULT_TAB
  searchQuery.value = ''
})
</script>

<template>
  <UDialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay :class="cn(overlayStyles)" />
      <UDialogContent
        class="p-0 border-0 rounded-none gap-4 grid size-full max-w-full overflow-clip md:border md:rounded md:h-[90%] md:w-352 sm:max-w-full"
        @close-auto-focus.prevent
      >
        <TabsRoot v-model:model-value="tab" activation-mode="manual" orientation="vertical" class="flex">
          <SettingsDialogSidebar />

          <div class="flex flex-1 flex-col">
            <UDialogHeader
              class="mb-0 pe-2.5 ps-4 border-b flex shrink-0 gap-2 h-header-height justify-center sm:text-left"
              :ui="{
                closeButton: 'top-2 right-2',
              }"
            >
              <DialogTitle class="font-medium">
                {{ SETTINGS_CATEGORY_METADATA[tab].title }}
              </DialogTitle>

              <VisuallyHidden>
                <DialogDescription> {{ SETTINGS_CATEGORY_METADATA[tab].title }} settings </DialogDescription>
              </VisuallyHidden>
            </UDialogHeader>

            <TabsContent v-for="setting in SETTINGS_CATEGORY_METADATA" :key="setting.key" :value="setting.key">
              <SettingsContent :category="setting.key" />
            </TabsContent>
          </div>
        </TabsRoot>
      </UDialogContent>
    </DialogPortal>
  </UDialogRoot>
</template>
