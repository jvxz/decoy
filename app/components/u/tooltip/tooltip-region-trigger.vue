<script lang="ts" setup generic="TName extends TooltipName">
import type { PrimitiveProps } from 'reka-ui'

import { Primitive, useForwardExpose, useForwardProps } from 'reka-ui'

const props = withDefaults(
  defineProps<PrimitiveProps & { class?: string; region: TName; value: TooltipRegions[TName] }>(),
  { as: 'div' },
)

const { close, contentId, currentTarget, disableClosingTrigger, disabled, openAt } = useTooltipRegion(props.region)
const { currentElement, forwardRef } = useForwardExpose()

const isOpen = computed(() => !!currentElement.value && currentElement.value === currentTarget.value)

let isPointerDown = false
let hasPointerMoveOpened = false

const open = (e: Event) => {
  if (e.currentTarget instanceof HTMLElement) openAt(e.currentTarget, props.value)
}

const listeners = computed(() =>
  disabled.value
    ? {}
    : {
        blur: close,
        click: () => !disableClosingTrigger.value && close(),
        focus: (e: FocusEvent) => {
          if (isPointerDown || !(e.target as HTMLElement).matches?.(':focus-visible')) return
          open(e)
        },
        pointerdown: () => {
          if (!disableClosingTrigger.value) close()
          isPointerDown = true
          document.addEventListener('pointerup', () => setTimeout(() => (isPointerDown = false), 1), { once: true })
        },
        pointerleave: () => {
          hasPointerMoveOpened = false
          close()
        },
        pointermove: (e: PointerEvent) => {
          if (e.pointerType === 'touch' || hasPointerMoveOpened) return
          hasPointerMoveOpened = true
          open(e)
        },
      },
)

const delegated = reactiveOmit(props, ['class', 'region', 'value'])
const forwarded = useForwardProps(delegated)
</script>

<template>
  <Primitive
    :ref="forwardRef"
    v-bind="forwarded"
    :aria-describedby="isOpen ? contentId : undefined"
    :class="cn(props.class)"
    data-slot="tooltip-region-trigger"
    v-on="listeners"
  >
    <slot />
  </Primitive>
</template>
