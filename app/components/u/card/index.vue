<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'
import type { VariantProps } from 'tailwind-variants'
import type { HTMLAttributes } from 'vue'

export interface UCardProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
  variant?: VariantProps<typeof staticBase>['variant']
  spacing?: VariantProps<typeof staticBase>['spacing']
}

const props = defineProps<UCardProps>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive
    v-bind="delegated"
    :class="cn(staticBase({ variant, spacing }), 'flex flex-col shadow-lg', props.class)"
    data-slot="card"
  >
    <slot />
  </Primitive>
</template>
