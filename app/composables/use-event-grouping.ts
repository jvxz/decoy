import type { MatrixEvent } from 'matrix-js-sdk'

interface GroupedEvent {
  events: MatrixEvent[]
  grouped: boolean[]
  dateDiffed: boolean[]
}

interface Opts {
  events: Ref<MatrixEvent[]>
  eventsPaginated: Ref<MatrixEvent[]>
}

export function useEventGrouping(opts: Opts) {
  const timezone = getCurrentTimezone()
  const { events: rawEvents, eventsPaginated } = opts

  const groupedAll = computed<GroupedEvent>(() => {
    let prevEvent: MatrixEvent | undefined
    let currentGroupTsCutoff = -1
    let latestDateSeen: Temporal.ZonedDateTime | undefined

    const events: MatrixEvent[] = []
    const grouped: GroupedEvent['grouped'] = []
    const dateDiffed: GroupedEvent['dateDiffed'] = []

    const GROUP_WINDOW_MS = 15 * 60 * 1000

    for (let i = 0; i < rawEvents.value.length; i++) {
      const event = rawEvents.value[i]
      assert(event, '`event` was undefined when looping over events to group')

      const sameSender = prevEvent && event.getSender() === prevEvent.getSender()
      const sameEventType = prevEvent && event.getType() === prevEvent.getType()
      const isReply = checkReplyEvent(event)
      const withinWindow = currentGroupTsCutoff !== -1 && event.getTs() < currentGroupTsCutoff
      const shouldGroup = !!(sameSender && sameEventType && withinWindow && !isReply)

      if (!shouldGroup) currentGroupTsCutoff = event.getTs() + GROUP_WINDOW_MS

      grouped.push(shouldGroup)
      events.push(event)

      let isDateDiffed = false
      const eventInstant = Temporal.Instant.fromEpochMilliseconds(event.getTs()).toZonedDateTimeISO(timezone)

      if (!latestDateSeen) {
        latestDateSeen = eventInstant
        isDateDiffed = true
      } else {
        isDateDiffed = Temporal.PlainDate.compare(eventInstant.toPlainDate(), latestDateSeen.toPlainDate()) > 0
        if (isDateDiffed) latestDateSeen = eventInstant
      }

      dateDiffed.push(isDateDiffed)

      prevEvent = event
    }

    return { dateDiffed, events, grouped }
  })

  const groupedEvents = computed<GroupedEvent>(() => {
    const all = groupedAll.value
    const firstId = eventsPaginated.value[0]?.getId()
    const start = firstId === undefined ? -1 : all.events.findIndex(e => e.getId() === firstId)
    if (start === -1) return { dateDiffed: [], events: [], grouped: [] }

    const end = start + eventsPaginated.value.length
    return {
      dateDiffed: all.dateDiffed.slice(start, end),
      events: all.events.slice(start, end),
      grouped: all.grouped.slice(start, end),
    }
  })

  return groupedEvents
}
