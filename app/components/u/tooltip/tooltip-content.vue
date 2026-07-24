<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { TooltipArrow, useForwardPropsEmits } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 6,
})

const emits = defineEmits<TooltipContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="{ ...forwarded, ...$attrs }"
      id="tooltip-content"
      :collision-padding="4"
      :class="
        cn(
          staticBase({ variant: 'raised' }),
          'will-change-transform will-change-opacity border-border-strong bg-surface-top z-tooltip p-0 px-3 py-1.5 text-sm text-balance font-medium',
          props.class,
        )
      "
    >
      <slot />
      <TooltipArrow rounded class="translate-y-px scale-140 fill-surface-top stroke-border-strong" />
    </TooltipContent>
  </TooltipPortal>
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

#tooltip-content[data-state='instant-open'] {
  animation: tooltip-in 75ms ease;
}
#tooltip-content[data-state='delayed-open'] {
  animation: tooltip-in 75ms ease;
}

#tooltip-content[data-state='closed'] {
  animation: tooltip-out 75ms ease;
}
</style>
