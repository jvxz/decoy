<script lang="ts" setup>
import { useForwardProps } from 'reka-ui'

import type { ButtonProps } from '../button.vue'

export interface UToastCloseProps extends ButtonProps {}

const props = withDefaults(defineProps<UToastCloseProps>(), {
  as: 'button',
})

const delegated = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegated)
</script>

<template>
  <UButton
    v-bind="forwarded"
    size="icon"
    aria-label="Close"
    variant="ghost"
    class="rounded-sm size-6 right-4 top-4 absolute"
  >
    <Icon name="tabler:x" />
  </UButton>
</template>
