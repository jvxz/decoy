<script lang="ts" setup generic="TName extends TooltipName">
import type { PopoverContentEmits, PopoverContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { useForwardPropsEmits } from 'reka-ui'

export type UTooltipRegionContentProps<TName extends TooltipName> = PopoverContentProps & {
  name: TName
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<UTooltipRegionContentProps<TName>>(), {
  align: 'center',
  collisionPadding: 4,
  side: 'top',
  sideOffset: 4,
})
const emits = defineEmits<PopoverContentEmits>()

const { close, payload, reference } = useTooltipRegion(props.name)

const delegated = reactiveOmit(props, ['name', 'reference'])
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="forwarded"
      data-slot="tooltip-region-content"
      :reference="reference ?? undefined"
      :class="
        cn(
          staticBase({ variant: 'default' }),
          'tooltip-content will-change-[transform,opacity] z-tooltip p-0 bg-surface-raised px-3 py-1.5 text-sm text-balance font-medium',
          props.class,
        )
      "
      @open-auto-focus.prevent
      @close-auto-focus.prevent
    >
      <slot :payload :close />

      <PopoverArrow rounded class="translate-y-px scale-140 fill-surface-raised stroke-border" />
    </PopoverContent>
  </PopoverPortal>
</template>

<style>
@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltip-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.tooltip-content[data-state='open'] {
  animation: tooltip-in 75ms ease;
}

.tooltip-content[data-state='closed'] {
  animation: tooltip-out 75ms ease;
}
</style>
