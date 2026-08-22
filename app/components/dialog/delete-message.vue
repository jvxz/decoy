<script lang="ts" setup>
import type { AlertDialogProps } from 'reka-ui'

import type { GlobalDialogMap } from '~/composables/use-global-dialog'

export type DeleteMessageDialogProps = AlertDialogProps & GlobalDialogMap['deleteMessage']

const props = defineProps<DeleteMessageDialogProps>()

const open = defineModel<boolean>('open')

const delegated = reactiveOmit(props, ['open', 'eventId'])

const reason = ref('')
const { redact } = useRoomActions(
  () => props.roomId,
  () => props.eventId,
)

whenever(open, () => (reason.value = ''))
</script>

<template>
  <UAlertDialogRoot v-bind="delegated" v-model:open="open">
    <UAlertDialogContent>
      <UAlertDialogHeader class="mb-0">
        <UAlertDialogTitle> Delete message </UAlertDialogTitle>
      </UAlertDialogHeader>

      <FormInput v-model:model-value="reason" label="Reason (optional)" textarea />

      <UAlertDialogFooter class="items-center">
        <UAlertDialogAnnotation> Shift + click to skip this dialog </UAlertDialogAnnotation>

        <UAlertDialogCancel> Cancel </UAlertDialogCancel>
        <UAlertDialogAction variant="danger" @click="redact.mutate({ reason })"> Delete </UAlertDialogAction>
      </UAlertDialogFooter>
    </UAlertDialogContent>
  </UAlertDialogRoot>
</template>
