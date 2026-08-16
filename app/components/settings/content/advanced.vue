<script lang="ts" setup>
const { client } = useMatrixClient()
const settings = useSettings()
const { notify, notifyError } = useNotifications()

const open = ref(false)
const { executeImmediate: resync, isLoading: isResyncing } = useAsyncState(
  async () => {
    try {
      await resetClientData(client.value)
    } catch (e) {
      if (isError(e)) throw e
      else throw new Error(String(e))
    } finally {
      reloadNuxtApp()
    }
  },
  undefined,
  {
    immediate: false,
    onError: e => {
      const title = 'Failed to re-sync Magi'
      if (isError(e)) {
        notifyError(e, title)
      } else {
        notify('error', {
          payload: {
            raw: String(e),
            title,
          },
        })
      }
    },
  },
)
</script>

<template>
  <SettingsContentLayout>
    <SettingsFormPrimitive
      :label="SETTINGS_ITEM_METADATA.advanced.resync.title"
      :description="SETTINGS_ITEM_METADATA.advanced.resync.description"
    >
      <UAlertDialogRoot
        :open
        @update:open="
          e => {
            if (isResyncing) return
            open = e
          }
        "
      >
        <UAlertDialogContent>
          <UAlertDialogHeader>
            <UAlertDialogTitle> {{ SETTINGS_ITEM_METADATA.advanced.resync.title }} </UAlertDialogTitle>
            <UAlertDescription>
              Re-syncing Magi does not log you out or invalidate your recovery key. Continuing will refresh the page
              when finished.
            </UAlertDescription>
          </UAlertDialogHeader>

          <UAlertDialogFooter>
            <UAlertDialogCancel :disabled="isResyncing"> Cancel </UAlertDialogCancel>

            <UButton variant="danger" :is-loading="isResyncing" @click="resync">
              <span>Continue</span>
            </UButton>
          </UAlertDialogFooter>
        </UAlertDialogContent>

        <UAlertDialogTrigger variant="default" as-child>
          <UButton variant="danger">
            {{ SETTINGS_ITEM_METADATA.advanced.resync.title }}
          </UButton>
        </UAlertDialogTrigger>
      </UAlertDialogRoot>
    </SettingsFormPrimitive>

    <SettingsFormSwitch
      v-model:model-value="settings.advanced.developerMode"
      :label="SETTINGS_ITEM_METADATA.advanced.developerMode.title"
      :description="SETTINGS_ITEM_METADATA.advanced.developerMode.description"
    />
  </SettingsContentLayout>
</template>
