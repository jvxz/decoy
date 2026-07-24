<script lang="ts" setup>
import type { UCardProps } from '~/components/u/card/index.vue'

import type { SettingsFormPrimitiveProps } from '../form/primitive.vue'

export interface SettingsItemPrimitiveProps extends Omit<SettingsFormPrimitiveProps, 'ui'>, UCardProps {}

const props = defineProps<SettingsItemPrimitiveProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <SettingsFormPrimitive
    v-bind="delegated"
    :class="cn('flex-col justify-start items-start', props.class)"
    data-slot="settings-item-primitive"
  >
    <template #label="bind">
      <slot name="label" v-bind="bind" />
    </template>

    <slot />
  </SettingsFormPrimitive>
</template>
