import type { TooltipRootProps } from 'reka-ui'
import type { ToRefs } from 'vue'

export interface TooltipRegionApi<T = unknown> extends ToRefs<
  Required<Pick<TooltipRootProps, 'disableClosingTrigger'>>
> {
  open: Ref<boolean>
  reference: Ref<VirtualElement | undefined>
  payload: Ref<T | undefined>
  openAt: (el: MaybeElement, payload: T) => void
  close: () => void
  disabled: Ref<boolean>
  contentId: string
  currentTarget: Ref<MaybeElement>
}

const tooltipMap = new Map<TooltipName, InjectionKey<TooltipRegionApi<unknown>>>()
export function getTooltipKey<T extends TooltipName>(name: T) {
  let key = tooltipMap.get(name)
  if (!key) {
    key = Symbol(`tooltip:${name}`)
    tooltipMap.set(name, key)
  }
  return key
}

export function useTooltipRegion<T extends TooltipName>(name: T) {
  const api = inject(getTooltipKey(name))
  assert(api, 'failed to get tooltip region API. `useTooltipRegion` must be used inside `<UTooltipRegionRoot>`')

  return api as TooltipRegionApi<TooltipRegions[T]>
}

export const TOOLTIP_OPEN_ATTR = 'data-tooltip-open'
export function setTooltipOpenAttr(el: Element, action: 'add' | 'remove') {
  if (!(el instanceof HTMLElement)) return

  if (action === 'add') el.setAttribute(TOOLTIP_OPEN_ATTR, '')
  else el.removeAttribute(TOOLTIP_OPEN_ATTR)
}
