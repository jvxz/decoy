<script setup lang="ts" generic="TName extends TooltipName">
import type { PopoverRootEmits, PopoverRootProps, TooltipRootProps } from 'reka-ui'

import { injectTooltipProviderContext, useForwardPropsEmits } from 'reka-ui'

export type UTooltipRegionRootProps<TName extends TooltipName> = PopoverRootProps &
  Pick<TooltipRootProps, 'disableClosingTrigger'> & {
    name: TName
    disabled?: boolean
    delayDuration?: number
  }

const props = withDefaults(defineProps<UTooltipRegionRootProps<TName>>(), {
  delayDuration: undefined,
  disableClosingTrigger: false,
  disabled: false,
})
const emits = defineEmits<PopoverRootEmits>()
type T = TooltipRegions[TName]

const providerContext = injectTooltipProviderContext()

const open = defineModel<boolean>('open')

const reference = shallowRef<VirtualElement>()
const payload = shallowRef<T>()

const contentId = useId()
const { start: startOpen, stop: stopOpen } = useTimeoutFn(
  () => (open.value = true),
  () => props.delayDuration ?? providerContext.delayDuration.value,
  { immediate: false },
)

watch(open, v => {
  if (v) return providerContext.onOpen()

  providerContext.onClose()
  close()
})

const currentTarget = shallowRef<MaybeElement>()
watch(currentTarget, (el, prev) => {
  if (prev) setTooltipOpenAttr(prev, 'remove')
  if (el) setTooltipOpenAttr(el, 'add')
})
function openAt(el: HTMLElement, next: T) {
  if (currentTarget.value && currentTarget.value !== el) setTooltipOpenAttr(currentTarget.value, 'remove')
  setTooltipOpenAttr(el, 'add')
  currentTarget.value = el

  reference.value = createFrozenReference(el)
  payload.value = next

  if (providerContext.isOpenDelayed.value) startOpen()
  else {
    stopOpen()
    open.value = true
  }
}

function close() {
  stopOpen()
  if (currentTarget.value) setTooltipOpenAttr(currentTarget.value, 'remove')

  open.value = false
  currentTarget.value = undefined
}

const propsRefs = toRefs(reactivePick(props, ['disableClosingTrigger', 'disabled']))

provide(getTooltipKey(props.name), {
  ...propsRefs,
  close,
  contentId,
  currentTarget,
  open,
  openAt,
  payload,
  reference,
} as TooltipRegionApi)

const delegated = reactiveOmit(props, [
  'name',
  'open',
  'defaultOpen',
  'disableClosingTrigger',
  'disabled',
  'delayDuration',
])
const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <PopoverRoot v-bind="forwarded" v-model:open="open" data-slot="tooltip-region-root">
    <VisuallyHidden>
      <PopoverAnchor />
    </VisuallyHidden>

    <slot />
  </PopoverRoot>
</template>
