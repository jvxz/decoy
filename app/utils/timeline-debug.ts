/**
 * Recorder for diagnosing scroll behaviour with real input.
 *
 * Two streams, one clock:
 *  - `events`: what the paginator decided (fetch, grow, trim, anchor restore).
 *  - `frames`: what the DOM actually did, sampled once per animation frame.
 *
 * The frame stream attributes every pixel of scroll movement. A frame's `dst`
 * should equal the wheel input plus the paginator's own writes; whatever is left
 * over came from the browser (native scroll anchoring, scroll chaining) and is
 * the usual source of "it jumped and nothing in my code did it".
 *
 * Enabled by `?debug=1`. Nothing here runs otherwise.
 */

interface DebugEvent {
  t: number
  type: string
  data?: Record<string, unknown>
}

interface Frame {
  t: number
  /** ms since the previous frame; >32 is a visible hitch. */
  dt: number
  st: number
  dst: number
  sh: number
  dsh: number
  /** Largest movement among sampled rows present in both frames. */
  worst: number
  /** How many sampled rows moved. */
  moved: number
  /** Rows that appeared, vanished, or changed height this frame. */
  neu: number
  gone: number
  resized: number
  /** Scroll input from the user since the last frame. */
  wheel: number
  /** Scroll the paginator wrote since the last frame, with its reasons. */
  wrote: number
  reasons: string[]
}

const MAX_EVENTS = 4000
const MAX_FRAMES = 30000
/** Rows sampled per frame — enough to catch any shift, cheap enough not to cause one. */
const SAMPLE = 8
/**
 * The recording is written to storage so it can be read from any tab on this
 * origin — whoever reads it back is usually not the tab that produced it.
 */
const STORAGE_KEY = 'pgs:recording'
const SKELETON_RE = /skeleton/i

class TimelineDebug {
  enabled = false
  events: DebugEvent[] = []
  frames: Frame[] = []

  private running = false
  private wheelSince = 0
  private wroteSince = 0
  private reasonsSince: string[] = []
  private detach: (() => void) | null = null

  log(type: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return
    this.events.push({ data, t: Math.round(performance.now()), type })
    if (this.events.length > MAX_EVENTS) this.events.shift()
  }

  /** Called by the paginator immediately around its own `scrollTop` writes. */
  logWrite(from: number, to: number, reason: string): void {
    if (!this.enabled) return
    this.wroteSince += to - from
    this.reasonsSince.push(reason)
    this.log('write', { delta: Math.round(to - from), from: Math.round(from), reason })
  }

  start(container: HTMLElement): void {
    if (!this.enabled || this.running) return
    this.running = true

    const onWheel = (e: WheelEvent) => {
      this.wheelSince += e.deltaY
    }
    container.addEventListener('wheel', onWheel, { passive: true })
    this.detach = () => container.removeEventListener('wheel', onWheel)

    const sample = () => {
      const rows = [...container.querySelectorAll<HTMLElement>('[data-item-id]')]
      const step = Math.max(1, Math.floor(rows.length / SAMPLE))
      const m = new Map<string, { top: number; h: number }>()
      for (let i = 0; i < rows.length; i += step) {
        const row = rows[i]!
        const r = row.getBoundingClientRect()
        m.set(row.dataset.itemId!, { h: Math.round(r.height), top: Math.round(r.top) })
      }
      return m
    }

    let prev = sample()
    let prevSt = container.scrollTop
    let prevSh = container.scrollHeight
    let prevT = performance.now()

    const record = () => {
      const now = performance.now()
      const cur = sample()

      let worst = 0
      let moved = 0
      let neu = 0
      let gone = 0
      let resized = 0
      for (const [key, box] of cur) {
        const was = prev.get(key)
        if (!was) {
          neu++
          continue
        }
        const d = box.top - was.top
        if (d !== 0) moved++
        if (Math.abs(d) > Math.abs(worst)) worst = d
        if (box.h !== was.h) resized++
      }
      for (const key of prev.keys()) if (!cur.has(key)) gone++

      const st = container.scrollTop
      const sh = container.scrollHeight

      this.frames.push({
        dsh: sh - prevSh,
        dst: Math.round(st - prevSt),
        dt: Math.round(now - prevT),
        gone,
        moved,
        neu,
        reasons: this.reasonsSince,
        resized,
        sh,
        st: Math.round(st),
        t: Math.round(now),
        wheel: Math.round(this.wheelSince),
        worst,
        wrote: Math.round(this.wroteSince),
      })
      if (this.frames.length > MAX_FRAMES) this.frames.shift()

      this.wheelSince = 0
      this.wroteSince = 0
      this.reasonsSince = []
      prev = cur
      prevSt = st
      prevSh = sh
      prevT = now
    }

    const tick = () => {
      if (!this.running) return
      record()
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // `requestAnimationFrame` is throttled to nothing whenever the page is not
    // being painted, and a tab driven over CDP can report itself that way while
    // someone is plainly looking at it. Scroll events keep arriving regardless,
    // so they drive a second, throttled sampler — without it a whole session can
    // record zero frames.
    let lastScrollSample = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - lastScrollSample < 32) return
      lastScrollSample = now
      record()
    }
    container.addEventListener('scroll', onScroll, { passive: true })

    const persist = () => this.persist()
    const persistTimer = setInterval(persist, 2000)
    document.addEventListener('visibilitychange', persist)
    window.addEventListener('pagehide', persist)

    const detachWheel = this.detach
    this.detach = () => {
      detachWheel?.()
      container.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', persist)
      window.removeEventListener('pagehide', persist)
      clearInterval(persistTimer)
    }
  }

  /**
   * Writes the analysed recording to storage so it can be read from any tab on
   * this origin — the tab that produced a session is often not the one that
   * reads it back. Only the summary is stored; raw frames stay in memory.
   */
  persist(): void {
    if (!this.enabled) return
    try {
      // A tab left open keeps persisting long after its useful pass is over,
      // and has already destroyed three marked sessions. A recording nobody
      // marked never replaces one somebody did.
      const marks = this.events.filter(e => e.type === 'MARK').length
      if (marks === 0) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && (JSON.parse(stored) as { marks?: number }).marks) return
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          events: this.events,
          marks,
          savedAt: new Date().toISOString(),
          summary: this.summary(),
          url: location.href,
        }),
      )
    } catch {
      // A full quota is not worth breaking the page over.
    }
  }

  stop(): void {
    this.persist()
    this.running = false
    this.detach?.()
    this.detach = null
  }

  clear(): void {
    this.events = []
    this.frames = []
  }

  /**
   * Frames worth looking at, each with the paginator events around it.
   *
   * `shift`: rows moved with no row added, removed, or resized — the viewport
   * jumped under content that did not change.
   * `unaccounted`: scroll movement no wheel event and no paginator write asked for.
   * `hitch`: a frame long enough to see.
   */
  summary() {
    const near = (t: number) =>
      this.events
        .filter(e => e.t >= t - 200 && e.t <= t + 50)
        .map(e => `${e.type}${e.data ? ` ${JSON.stringify(e.data)}` : ''}`)

    const shift = this.frames
      .filter(f => Math.abs(f.worst) > 4 && f.neu === 0 && f.gone === 0 && f.resized === 0)
      .map(f => ({ ctx: near(f.t), frame: f }))

    const unaccounted = this.frames
      .filter(f => Math.abs(f.dst - f.wheel - f.wrote) > 4)
      .map(f => ({ ctx: near(f.t), frame: f, unexplained: Math.round(f.dst - f.wheel - f.wrote) }))

    const hitch = this.frames.filter(f => f.dt > 32).map(f => ({ ctx: near(f.t), frame: f }))

    const marks = this.events
      .filter(e => e.type === 'MARK')
      .map(mark => ({
        at: mark.t,
        before: this.frames
          .filter(f => f.t >= mark.t - 6000 && f.t <= mark.t + 3000)
          .filter(f => Math.abs(f.worst) > 4 || f.dt > 32 || Math.abs(f.dst - f.wheel - f.wrote) > 4)
          .map(f => ({ ...f, unexplained: Math.round(f.dst - f.wheel - f.wrote) })),
        events: this.events.filter(e => e.t >= mark.t - 6000 && e.t <= mark.t + 3000 && e.type !== 'MARK'),
        // How long the paginator was silent either side of the mark: a freeze
        // shows up as a large gap, which no anomalous frame will ever record.
        quietAfter: Math.round((this.events.find(e => e.t > mark.t && e.type !== 'MARK')?.t ?? mark.t) - mark.t),
        quietBefore: Math.round(
          mark.t - (this.events.filter(e => e.t < mark.t && e.type !== 'MARK').at(-1)?.t ?? mark.t),
        ),
      }))

    return {
      counts: {
        events: this.events.length,
        frames: this.frames.length,
        hitch: hitch.length,
        shift: shift.length,
        unaccounted: unaccounted.length,
      },
      hitch: hitch.slice(0, 12),
      marks,
      seconds: this.frames.length > 0 ? Math.round((this.frames.at(-1)!.t - this.frames[0]!.t) / 100) / 10 : 0,
      shift: shift.slice(0, 15),
      unaccounted: unaccounted.slice(0, 15),
      worstShift: shift.reduce((worst, s) => (Math.abs(s.frame.worst) > Math.abs(worst) ? s.frame.worst : worst), 0),
    }
  }
}

export const timelineDebug = new TimelineDebug()

export function initTimelineDebug(container: HTMLElement, enabled: boolean): void {
  if (!enabled) return
  timelineDebug.enabled = true
  timelineDebug.clear()
  timelineDebug.start(container)
  // Handles for driving it from the console.
  ;(globalThis as unknown as { pgs: TimelineDebug }).pgs = timelineDebug

  // A recording that silently captured nothing costs a whole session, so show
  // the counts on screen rather than making anyone verify from a console.
  const badge = document.createElement('div')
  badge.style.cssText =
    'position:fixed;bottom:8px;right:8px;z-index:99999;font:11px ui-monospace,monospace;' +
    'background:#000c;color:#0f0;padding:4px 7px;border-radius:4px;pointer-events:none;white-space:pre'
  document.body.appendChild(badge)
  setInterval(() => {
    const marks = timelineDebug.events.filter(e => e.type === 'MARK').length
    badge.textContent = `REC ${timelineDebug.frames.length}f ${timelineDebug.events.length}e ${marks}★  \` to mark`
  }, 400)

  // Backtick marks the moment something looked wrong, so a report can be matched
  // against the frame where it happened instead of the whole recording.
  document.addEventListener('keydown', event => {
    if (event.key !== '`' || event.repeat) return
    const target = event.target as HTMLElement | null
    if (target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

    // A mark often lands on something the frame stream cannot see — a gap, a
    // duplicate, a list that stopped loading. Fingerprint the window itself so
    // there is evidence even when position and timing look perfectly normal.
    const rows = [...container.querySelectorAll<HTMLElement>('[data-item-id]')]
    timelineDebug.log('MARK', {
      atBottom: container.scrollHeight - container.clientHeight - container.scrollTop < 4,
      first: rows[0]?.dataset.itemId,
      last: rows.at(-1)?.dataset.itemId,
      rows: rows.length,
      sh: container.scrollHeight,
      skeleton: SKELETON_RE.test(container.innerHTML),
      st: Math.round(container.scrollTop),
    })
  })
}
