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
  keepViewports?: number
  followTail?: boolean
}

const ROW_ATTR = 'data-item-id'

export function useTimelinePagination<T>(container: Ref<HTMLElement | null | undefined>, opts: Options<T>) {
  const {
    followTail = false,
    getKey,
    hasMore,
    keepViewports = 2,
    maxItems = 160,
    onBeforePaginate,
    pageSize = 80,
    source,
  } = opts

  const startKey = ref<string | null>(null)
  const endKey = ref<string | null>(null)
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

  function restoreAnchor(anchor: Anchor | null, reason: string): void {
    const el = container.value
    if (!el || !anchor) return

    const row = getRow(anchor.key)
    if (!row) {
      timelineDebug.log('restore:lost-anchor', { key: anchor.key, reason })
      return
    }

    const drift = viewportTopOf(row, el) - anchor.viewportTop
    if (Math.abs(drift) < 0.5) return

    const to = el.scrollTop + drift
    timelineDebug.logWrite(el.scrollTop, to, reason)
    el.scrollTop = to
  }

  function dropTo(side: 'end' | 'start'): number | null {
    const el = container.value
    const b = bounds.value
    if (!el || !b) return null

    const runway = viewportPx() * keepViewports
    const keepFrom = el.scrollTop - runway
    const keepTo = el.scrollTop + viewportPx() + runway

    const items = source.value
    let index = side === 'start' ? b.s : b.e

    while (index !== (side === 'start' ? b.e : b.s)) {
      const row = getRow(getKey(items[index]!))
      if (!row) break

      const top = row.offsetTop
      const bottom = top + row.offsetHeight
      const beyondRunway = side === 'start' ? bottom < keepFrom : top > keepTo
      if (!beyondRunway) break

      index += side === 'start' ? 1 : -1
    }

    return index === (side === 'start' ? b.s : b.e) ? null : index
  }

  type StepResult = 'busy' | 'exhausted' | 'fetched' | 'no-window' | 'revealed'

  async function paginate(dir: PaginateDirection): Promise<StepResult> {
    if (isPaginating.value[dir]) {
      timelineDebug.log('paginate:skip', { dir, why: 'in-flight' })
      return 'busy'
    }

    const b = bounds.value
    if (!b) {
      timelineDebug.log('paginate:skip', { dir, why: 'no-window' })
      return 'no-window'
    }

    const atSourceEdge = dir === 'backward' ? b.s === 0 : b.e === source.value.length - 1
    if (atSourceEdge && !hasMore(dir)) {
      timelineDebug.log('paginate:skip', { dir, why: 'exhausted' })
      return 'exhausted'
    }

    isPaginating.value = { ...isPaginating.value, [dir]: true }
    timelineDebug.log('paginate:start', { dir, e: b.e, s: b.s, sourceLen: source.value.length })
    try {
      if (atSourceEdge) {
        timelineDebug.log('fetch:start', { dir })
        await onBeforePaginate(dir)
        await nextTick()
        timelineDebug.log('fetch:end', { dir, sourceLen: source.value.length })
        return 'fetched'
      }

      const next = bounds.value
      if (!next) return 'no-window'

      const anchor = captureAnchor(dir)
      const items = source.value

      if (dir === 'backward') {
        const s = Math.max(0, next.s - pageSize)
        let e = Math.max(dropTo('end') ?? next.e, s)
        if (e - s + 1 > maxItems) e = s + maxItems - 1
        startKey.value = getKey(items[s]!)
        endKey.value = getKey(items[e]!)
      } else {
        const e = Math.min(items.length - 1, next.e + pageSize)
        let s = Math.min(dropTo('start') ?? next.s, e)
        if (e - s + 1 > maxItems) s = e - (maxItems - 1)
        startKey.value = getKey(items[s]!)
        endKey.value = getKey(items[e]!)
      }

      await nextTick()
      restoreAnchor(anchor, `paginate:${dir}`)

      await afterNextFrame()
      restoreAnchor(anchor, `paginate:${dir}:settle`)

      timelineDebug.log('paginate:end', {
        count: window.value.length,
        dir,
        e: bounds.value?.e,
        s: bounds.value?.s,
      })
      return 'revealed'
    } finally {
      isPaginating.value = { ...isPaginating.value, [dir]: false }
    }
  }

  const backSentinel = ref<HTMLElement | null>(null)
  const forwardSentinel = ref<HTMLElement | null>(null)

  function isArmed(dir: PaginateDirection): boolean {
    const el = container.value
    const sentinel = dir === 'backward' ? backSentinel.value : forwardSentinel.value
    if (!el || !sentinel) return false

    const view = el.getBoundingClientRect()
    const mark = sentinel.getBoundingClientRect()
    const margin = viewportPx()
    return dir === 'backward' ? mark.bottom > view.top - margin : mark.top < view.bottom + margin
  }

  async function fill(dir: PaginateDirection): Promise<void> {
    let barren = 0

    for (let step = 0; step < 8 && isArmed(dir); step++) {
      const rowsBefore = window.value.length
      const sourceBefore = source.value.length
      const result = await paginate(dir)

      if (result === 'busy' || result === 'exhausted' || result === 'no-window') {
        timelineDebug.log('fill:stop', { dir, rows: rowsBefore, step, why: result })
        return
      }

      if (result === 'revealed') {
        barren = 0
        continue
      }

      if (source.value.length === sourceBefore) {
        barren++
        timelineDebug.log('fill:barren', { attempt: barren, dir, rows: rowsBefore })
        if (barren >= 3) {
          timelineDebug.log('fill:stop', { dir, rows: rowsBefore, step, why: 'barren' })
          return
        }
      } else {
        barren = 0
      }
    }
  }

  let chain: Promise<void> = Promise.resolve()

  function serialize(task: () => Promise<void>): Promise<void> {
    chain = chain.then(task, task)
    return chain
  }

  let observer: IntersectionObserver | null = null

  function observeSentinels(): void {
    observer?.disconnect()
    const el = container.value
    if (!el) return

    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const dir = entry.target === backSentinel.value ? 'backward' : 'forward'
          timelineDebug.log('sentinel:intersect', { dir })
          void serialize(() => fill(dir))
        }
      },
      { root: el, rootMargin: `${viewportPx()}px 0px` },
    )
    if (backSentinel.value) observer.observe(backSentinel.value)
    if (forwardSentinel.value) observer.observe(forwardSentinel.value)
  }

  function isAtTail(): boolean {
    const el = container.value
    if (!el) return false
    return el.scrollHeight - el.clientHeight - el.scrollTop < 4
  }

  async function reset(): Promise<void> {
    const items = source.value
    if (items.length === 0) {
      startKey.value = null
      endKey.value = null
      return
    }

    endKey.value = getKey(items.at(-1)!)
    startKey.value = getKey(items[Math.max(0, items.length - pageSize)]!)
    await nextTick()

    const el = container.value
    if (el) {
      timelineDebug.logWrite(el.scrollTop, el.scrollHeight, 'reset:pin-bottom')
      el.scrollTop = el.scrollHeight
    }
    observeSentinels()
    await serialize(() => fill('backward'))
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

    startKey.value = state.startKey
    endKey.value = state.endKey
    await nextTick()

    const el = container.value
    const row = getRow(state.anchorKey)
    if (!el || !row) return false

    timelineDebug.logWrite(el.scrollTop, row.offsetTop - state.anchorOffset, 'restore-state')
    el.scrollTop = row.offsetTop - state.anchorOffset
    observeSentinels()
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
      timelineDebug.log('source:change', { atTail, len: source.value.length })
      if (followTail && atTail && bounds.value) {
        endKey.value = getKey(source.value.at(-1)!)
        await nextTick()
        const el = container.value
        if (el) {
          timelineDebug.logWrite(el.scrollTop, el.scrollHeight, 'follow-tail')
          el.scrollTop = el.scrollHeight
        }
        return
      }

      for (const dir of ['backward', 'forward'] as const) {
        if (isArmed(dir)) void serialize(() => fill(dir))
      }
    },
  )

  onMounted(async () => {
    await nextTick()
    await reset()
  })

  onBeforeUnmount(() => observer?.disconnect())

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
