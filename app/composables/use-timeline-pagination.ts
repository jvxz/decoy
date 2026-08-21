import type { Ref } from 'vue'

export type PaginateDirection = 'backward' | 'forward'

export interface TimelineScrollState {
  anchorKey: string
  anchorOffset: number
  endKey: string
  startKey: string
}

interface Options<T> {
  source: Ref<T[]>
  getKey: (item: T) => string
  hasMore: (dir: PaginateDirection) => boolean
  onBeforePaginate: (dir: PaginateDirection) => Promise<void> | void
  pageSize?: number
  maxItems?: number
  followTail?: boolean
}

const ROW_ATTR = 'data-item-id'

const ARM_VIEWPORTS = 0.5
const FILL_VIEWPORTS = 3
const PREFETCH_PAGES = 3

export function useTimelinePagination<T>(container: Ref<HTMLElement | null | undefined>, opts: Options<T>) {
  const { followTail = false, getKey, hasMore, maxItems = 160, onBeforePaginate, pageSize = 80, source } = opts

  const startKey = ref<string | null>(null)
  const endKey = ref<string | null>(null)

  let generation = 0
  const isPaginating = ref<Record<PaginateDirection, boolean>>({ backward: false, forward: false })

  const keyToIndex = computed(() => {
    const m = new Map<string, number>()
    source.value.forEach((item, i) => m.set(getKey(item), i))
    return m
  })

  const bounds = computed(() => {
    const items = source.value
    if (items.length === 0 || startKey.value === null || endKey.value === null) return null

    let s = keyToIndex.value.get(startKey.value)
    let e = keyToIndex.value.get(endKey.value)
    if (s === undefined && e === undefined) return null
    s ??= Math.max(0, e! - pageSize)
    e ??= Math.min(items.length - 1, s + pageSize)

    return s <= e ? { e, s } : { e: s, s: e }
  })

  const window = computed<T[]>(() => {
    const b = bounds.value
    return b ? source.value.slice(b.s, b.e + 1) : []
  })

  function getRow(key: string): HTMLElement | null {
    return container.value?.querySelector(`[${ROW_ATTR}="${CSS.escape(key)}"]`) ?? null
  }

  function viewportPx(): number {
    return container.value?.clientHeight ?? 0
  }

  function afterNextFrame(): Promise<void> {
    return new Promise(resolve => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolve()
      }
      requestAnimationFrame(finish)
      setTimeout(finish, 50)
    })
  }

  interface Anchor {
    key: string
    viewportTop: number
  }

  function viewportTopOf(row: HTMLElement, el: HTMLElement): number {
    return row.getBoundingClientRect().top - el.getBoundingClientRect().top
  }

  function captureAnchor(dir: PaginateDirection): Anchor | null {
    const el = container.value
    const items = window.value
    if (!el || items.length === 0) return null

    const key = getKey(dir === 'backward' ? items[0]! : items.at(-1)!)
    const row = getRow(key)
    if (!row) return null

    return { key, viewportTop: viewportTopOf(row, el) }
  }

  function restoreAnchor(anchor: Anchor | null): void {
    const el = container.value
    if (!el || !anchor) return

    const row = getRow(anchor.key)
    if (!row) return

    const drift = viewportTopOf(row, el) - anchor.viewportTop
    if (Math.abs(drift) < 0.5) return

    writeScrollTop(el, el.scrollTop + drift)
  }

  type StepResult = 'busy' | 'exhausted' | 'fetched' | 'no-window' | 'revealed' | 'stale'

  let settleAnchor: Anchor | null = null

  async function paginate(dir: PaginateDirection): Promise<StepResult> {
    if (isPaginating.value[dir]) {
      return 'busy'
    }

    const b = bounds.value
    if (!b) {
      return 'no-window'
    }

    const atSourceEdge = dir === 'backward' ? b.s === 0 : b.e === source.value.length - 1
    if (atSourceEdge && !hasMore(dir)) {
      return 'exhausted'
    }

    const gen = generation
    isPaginating.value = { ...isPaginating.value, [dir]: true }
    try {
      if (atSourceEdge) {
        settleAnchor = null
        await onBeforePaginate(dir)
        await nextTick()
        if (gen !== generation) {
          return 'stale'
        }
        return 'fetched'
      }

      const next = bounds.value
      if (!next) return 'no-window'

      const anchor = captureAnchor(dir)
      const items = source.value

      let target: { e: number; s: number }
      if (dir === 'backward') {
        const s = Math.max(0, next.s - pageSize)
        target = { e: Math.min(next.e, s + maxItems - 1), s }
      } else {
        const e = Math.min(items.length - 1, next.e + pageSize)
        target = { e, s: Math.max(next.s, e - (maxItems - 1)) }
      }

      startKey.value = getKey(items[target.s]!)
      endKey.value = getKey(items[target.e]!)

      await nextTick()
      if (gen !== generation) {
        return 'stale'
      }
      restoreAnchor(anchor)
      settleAnchor = anchor

      return 'revealed'
    } finally {
      isPaginating.value = { ...isPaginating.value, [dir]: false }
    }
  }

  const backSentinel = ref<HTMLElement | null>(null)
  const forwardSentinel = ref<HTMLElement | null>(null)

  function isArmed(dir: PaginateDirection, viewports: number): boolean {
    const el = container.value
    const sentinel = dir === 'backward' ? backSentinel.value : forwardSentinel.value
    if (!el || !sentinel) return false

    const view = el.getBoundingClientRect()
    const mark = sentinel.getBoundingClientRect()
    const margin = viewportPx() * viewports
    return dir === 'backward' ? mark.bottom > view.top - margin : mark.top < view.bottom + margin
  }

  async function fill(dir: PaginateDirection): Promise<void> {
    const gen = generation
    settleAnchor = null
    let barren = 0

    try {
      const b = bounds.value
      if (b && hasMore(dir)) {
        const remaining = dir === 'backward' ? b.s : source.value.length - 1 - b.e
        if (remaining < PREFETCH_PAGES * pageSize) {
          isPaginating.value = { ...isPaginating.value, [dir]: true }
          try {
            await onBeforePaginate(dir)
            await nextTick()
          } finally {
            isPaginating.value = { ...isPaginating.value, [dir]: false }
          }
          if (gen !== generation) {
            return
          }
        }
      }

      for (let step = 0; step < 8 && isArmed(dir, FILL_VIEWPORTS); step++) {
        const sourceBefore = source.value.length
        const result = await paginate(dir)

        if (result === 'busy' || result === 'exhausted' || result === 'no-window' || result === 'stale') {
          return
        }

        if (result === 'revealed') {
          barren = 0
          continue
        }

        if (source.value.length === sourceBefore) {
          barren++
          if (barren >= 3) {
            return
          }
        } else {
          barren = 0
        }
      }
    } finally {
      const anchor = settleAnchor
      settleAnchor = null
      if (anchor && gen === generation) {
        await afterNextFrame()
        if (gen === generation) restoreAnchor(anchor)
      }
    }
  }

  interface FillRequest {
    dir: PaginateDirection
    force: boolean
  }

  let activeDirection: PaginateDirection | null = null
  let fillPromise: Promise<void> | null = null
  let isAdjusting = false
  let lastScrollTop = 0
  let queuedFill: FillRequest | null = null
  let scrollContainer: HTMLElement | null = null

  function syncScrollTop(el = container.value): void {
    if (el) lastScrollTop = el.scrollTop
  }

  function writeScrollTop(el: HTMLElement, to: number): void {
    el.scrollTop = to
    syncScrollTop(el)
  }

  async function drainFills(): Promise<void> {
    while (queuedFill) {
      const request = queuedFill
      queuedFill = null
      if (!request.force && request.dir !== activeDirection) continue

      isAdjusting = true
      try {
        await fill(request.dir)
      } finally {
        syncScrollTop()
        isAdjusting = false
      }
    }
  }

  function requestFill(dir: PaginateDirection, force = false): Promise<void> {
    if (!force && dir !== activeDirection) return Promise.resolve()

    queuedFill = { dir, force }
    if (!fillPromise) {
      fillPromise = drainFills().finally(() => {
        fillPromise = null
        if (queuedFill) void requestFill(queuedFill.dir, queuedFill.force)
      })
    }
    return fillPromise
  }

  function onScroll(): void {
    const el = scrollContainer
    if (!el || el.scrollTop === lastScrollTop) return

    const dir = el.scrollTop < lastScrollTop ? 'backward' : 'forward'
    lastScrollTop = el.scrollTop
    if (isAdjusting) return

    activeDirection = dir
    if (isArmed(dir, ARM_VIEWPORTS)) void requestFill(dir)
  }

  function watchScroll(): void {
    const el = container.value ?? null
    if (el === scrollContainer) {
      syncScrollTop(el)
      return
    }

    scrollContainer?.removeEventListener('scroll', onScroll)
    scrollContainer = el
    syncScrollTop(el)
    scrollContainer?.addEventListener('scroll', onScroll, { passive: true })
  }

  function isAtTail(): boolean {
    const el = container.value
    if (!el) return false
    return el.scrollHeight - el.clientHeight - el.scrollTop < 4
  }

  async function reset(): Promise<void> {
    const gen = ++generation
    const items = source.value
    if (items.length === 0) {
      startKey.value = null
      endKey.value = null
      return
    }

    endKey.value = getKey(items.at(-1)!)
    startKey.value = getKey(items[Math.max(0, items.length - pageSize)]!)
    await nextTick()
    if (gen !== generation) return

    const el = container.value
    if (el) {
      writeScrollTop(el, el.scrollHeight)
    }
    watchScroll()
    await requestFill('backward', true)
  }

  function captureState(): TimelineScrollState | null {
    const el = container.value
    if (!el || startKey.value === null || endKey.value === null) return null

    const view = el.getBoundingClientRect()
    const visible = window.value
      .map(item => ({ key: getKey(item), row: getRow(getKey(item)) }))
      .find(({ row }) => row && row.getBoundingClientRect().bottom > view.top)
    if (!visible?.row) return null

    return {
      anchorKey: visible.key,
      anchorOffset: visible.row.getBoundingClientRect().top - view.top,
      endKey: endKey.value,
      startKey: startKey.value,
    }
  }

  async function restoreState(state: TimelineScrollState): Promise<boolean> {
    if (!keyToIndex.value.has(state.anchorKey)) return false

    const gen = ++generation
    startKey.value = state.startKey
    endKey.value = state.endKey
    await nextTick()

    if (gen !== generation) return true

    const el = container.value
    const row = getRow(state.anchorKey)
    if (!el || !row) return false

    writeScrollTop(el, row.offsetTop - state.anchorOffset)
    watchScroll()
    return true
  }

  watch(
    () => source.value.length,
    async () => {
      if (startKey.value === null) {
        await reset()
        return
      }
      const atTail = isAtTail()
      if (followTail && atTail && bounds.value) {
        const gen = generation
        endKey.value = getKey(source.value.at(-1)!)
        await nextTick()
        if (gen !== generation) return
        const el = container.value
        if (el) {
          writeScrollTop(el, el.scrollHeight)
        }
      }
    },
  )

  onMounted(async () => {
    await nextTick()
    await reset()
  })

  onBeforeUnmount(() => scrollContainer?.removeEventListener('scroll', onScroll))

  return {
    backSentinel,
    captureState,
    forwardSentinel,
    isPaginating,
    reset,
    restoreState,
    window,
  }
}
