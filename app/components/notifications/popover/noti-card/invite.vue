<script lang="ts" setup>
const props = defineProps<{ notification: AppNotification<'invite'> }>()

const room = useRoom(() => props.notification.payload.roomId)

const roomName = useRoomComputed(room, r => (r ? resolveRoomName(r) : props.notification.payload.roomId))
const inviter = useInviter(room)

const { handleNotiDismiss } = useInvites()
</script>

<template>
  <NotificationsPopoverNotiCard v-bind="notification" @dismiss="handleNotiDismiss(notification.id)">
    <UToastTitle>Invited to {{ roomName }}</UToastTitle>

    <UToastDescription>
      You were invited to {{ roomName }}{{ `${inviter && ` by ${resolveUserName(inviter)}`}` }}
    </UToastDescription>

    <template #footer="{ handleDismiss, isToast, removeToast }">
      <UAlertFooter>
        <UButton v-if="!isToast" size="sm" @click="handleDismiss"> Dismiss </UButton>
        <UButton variant="default" size="sm" as-child @click="removeToast">
          <NuxtLink :to="{ name: 'invites' }">Go to invite</NuxtLink>
        </UButton>
      </UAlertFooter>
    </template>
  </NotificationsPopoverNotiCard>
</template>
