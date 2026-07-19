<script lang="ts" setup>
import type { Room } from 'matrix-js-sdk'
import type { AlertDialogEmits, AlertDialogProps } from 'reka-ui'

import { useForwardPropsEmits } from 'reka-ui'

export interface LeaveDialogProps extends AlertDialogProps {
  room: Room
}
export type LeaveDialogEmits = AlertDialogEmits

const props = defineProps<LeaveDialogProps>()
const emits = defineEmits<LeaveDialogEmits>()

const { leave } = useRoomActions(() => props.room)
const { isPending: isLeaving } = leave

const openModel = defineModel<boolean>('open', { default: false })
const open = computed({
  get: () => openModel.value,
  set: (e: boolean) => {
    if (isLeaving.value) return
    openModel.value = e
  },
})

const memberCount = useRoomMemberCount(() => props.room)
const dialogDescription = computed(() =>
  memberCount.value === 1
    ? 'You are the only remaining member of this room. Nobody will be able to access this room again.'
    : 'You will need an invite to join this room again.',
)

const delegated = reactiveOmit(props, ['room', 'open'])
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <UAlertDialogRoot v-bind="forwarded" v-model:open="open">
    <UAlertDialogContent>
      <UAlertDialogHeader>
        <UAlertDialogTitle> Are you sure? </UAlertDialogTitle>
        <UAlertDialogDescription
          :class="{
            'text-danger': memberCount === 1,
          }"
        >
          {{ dialogDescription }}
        </UAlertDialogDescription>
      </UAlertDialogHeader>

      <UAlertDialogFooter>
        <UAlertDialogCancel :disabled="isLeaving"> Cancel </UAlertDialogCancel>
        <UButton
          :is-loading="isLeaving"
          @click="
            () =>
              leave.mutate(undefined, {
                onSuccess: () => {
                  openModel = false
                },
              })
          "
        >
          <span>Leave</span>
        </UButton>
      </UAlertDialogFooter>
    </UAlertDialogContent>
  </UAlertDialogRoot>
</template>
