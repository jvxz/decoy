<script lang="ts" setup>
defineProps<{ notification: AppNotification<'error'> }>()

const { copy } = useClipboard()
</script>

<template>
  <NotificationsPopoverNotiCard
    :id="notification.id"
    :description="notification.payload.description"
    :title="notification.payload.title"
    icon="tabler:exclamation-circle"
  >
    <template #footer="{ handleDismiss, isToast }">
      <UAlertFooter v-if="isDefined(notification.payload.raw) || !isToast">
        <UButton v-if="!isToast" size="sm" @click="handleDismiss"> Dismiss </UButton>
        <UButton
          v-if="isDefined(notification.payload.raw)"
          variant="danger"
          size="sm"
          @click="copy(notification.payload.raw)"
        >
          Copy error
        </UButton>
      </UAlertFooter>
    </template>
  </NotificationsPopoverNotiCard>
</template>
