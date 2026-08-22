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

      <FormInput label="Reason (optional)" v-model:model-value="reason" textarea />

      <UAlertDialogFooter class="items-center">
        <UAlertDialogAnnotation> Shift + click to skip this dialog </UAlertDialogAnnotation>

        <UAlertDialogCancel> Cancel </UAlertDialogCancel>
        <UAlertDialogAction @click="redact.mutate({ reason })" variant="danger"> Delete </UAlertDialogAction>
      </UAlertDialogFooter>
    </UAlertDialogContent>
  </UAlertDialogRoot>
</template>
