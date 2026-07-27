<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export type UButtonCardIconProps = PrimitiveProps & {
  class?: HTMLAttributes['class']
} & (
    | {
        name: string
        src?: never
        alt?: never
      }
    | {
        name?: never
        src: string
        alt: string
      }
  )

const props = defineProps<UButtonCardIconProps>()

const delegated = reactiveOmit(props, ['class', 'src', 'name', 'alt'])
const classProp = computed(() => cn('shrink-0 h-1lh -mt-0.75', props.class))
</script>

<template>
  <Slot data-slot="button-card-icon">
    <Icon v-if="name" :name v-bind="delegated" :class="classProp" />
    <Img v-else :src :alt v-bind="delegated" :class="classProp" />
  </Slot>
</template>
