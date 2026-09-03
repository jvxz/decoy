<script lang="ts" setup>
import type { ContextMenuItemEmits, ContextMenuItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { useForwardPropsEmits } from 'reka-ui'

export interface UContextMenuItemProps extends ContextMenuItemProps {
  class?: HTMLAttributes['class']
  variant?: PopoverItemVariants['variant']
}
export type UContextMenuItemEmits = ContextMenuItemEmits

const props = defineProps<UContextMenuItemProps>()
const emits = defineEmits<UContextMenuItemEmits>()

const delegated = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <ContextMenuItem
    v-bind="forwarded"
    :class="
      cn(props.class, popoverItemBase({ variant }), 'has-[svg]:px-1.5 [&_.iconify]:!size-4 [&_svg]:!text-foreground')
    "
    data-slot="context-menu-item"
  >
    <slot />
  </ContextMenuItem>
</template>
