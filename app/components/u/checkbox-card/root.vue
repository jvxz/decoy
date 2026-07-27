<script lang="ts" setup>
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { useForwardPropsEmits } from 'reka-ui'

export interface UCheckboxCardRootProps extends CheckboxRootProps {
  class?: HTMLAttributes['class']
}
export type UCheckboxCardRootEmits = CheckboxRootEmits

const props = defineProps<UCheckboxCardRootProps>()
const emits = defineEmits<UCheckboxCardRootEmits>()

const delegated = reactiveOmit(props, ['as'])
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <CheckboxRoot v-bind="forwarded" as-child>
    <UButtonCardRoot :as>
      <slot />
    </UButtonCardRoot>
  </CheckboxRoot>
</template>
