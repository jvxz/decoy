import type { EventHookOn } from '@vueuse/core'
import type { Listener, MatrixEvent, Room, RoomEmittedEvents, RoomEventHandlerMap, RoomMember } from 'matrix-js-sdk'
import type { EffectScope, ShallowRef } from 'vue'

import { toRef } from '@vueuse/core'
import { RoomEvent, RoomStateEvent } from 'matrix-js-sdk'

type EmitterListener<T extends RoomEmittedEvents> = Listener<RoomEmittedEvents, RoomEventHandlerMap, T>

export interface RoomHooks {
  onTimeline: EmitterListener<RoomEvent.Timeline>
  onTimelineRefresh: EmitterListener<RoomEvent.TimelineRefresh>
  onTimelineReset: EmitterListener<RoomEvent.TimelineReset>
  onCurrentStateUpdated: EmitterListener<RoomEvent.CurrentStateUpdated>
  onAccountData: EmitterListener<RoomEvent.AccountData>
  onMemberUpdate: EmitterListener<RoomStateEvent.Members>
  onRoomMemberTyping: (event: MatrixEvent, member: RoomMember) => void
  onSummary: EmitterListener<RoomEvent.Summary>
  onLocalEchoUpdated: EmitterListener<RoomEvent.LocalEchoUpdated>
  onRedaction: EmitterListener<RoomEvent.Redaction>
}

export type RoomEventHooks = {
  [K in keyof RoomHooks]: EventHookOn<Parameters<RoomHooks[K]>>
}

type Key = string

interface Entry {
  scope: EffectScope
  ref: ShallowRef<Room | undefined>
  hooks: RoomEventHooks
  subs: number
}

const cache = new Map<string, Entry>()

const createKey = (roomId: string) => roomId

const DIGIT_RE = /^\d+$/

function acquire(roomId: string) {
  const key = createKey(roomId)

  let entry = cache.get(key)
  if (!entry) {
    const scope = effectScope(true)

    const instance = scope.run(() => {
      const { client } = useMatrixClient()
      const { onEvent, onRoom } = useMatrixHooks()

      const getRoom = () => {
        const real = client.value.getRoom?.(key)
        if (real) return real

        if (!isTestMode()) return client.value.getRoom(key)

        const mockEventCount = DIGIT_RE.test(key) ? Number(key) : 500
        return createMockRoom({ id: key, seedMessages: mockEventCount }).room
      }

      const rawRoom = getRoom()

      // markRaw is needed because the room mutates itself under the hood, breaking vue's proxy system
      const room = shallowRef<Room | undefined>(rawRoom ? markRaw(rawRoom) : undefined)
      const refresh = debounce(() => {
        const r = getRoom()

        room.value = r ? markRaw(r) : undefined
        triggerRef(room)
      }, 50)

      onRoom(refresh)
      onEvent(e => {
        if (e.getRoomId() === roomId) refresh()
      })

      const accountDataHook = createEventHook<Parameters<RoomHooks['onAccountData']>>()
      const currentStateUpdatedHook = createEventHook<Parameters<RoomHooks['onCurrentStateUpdated']>>()
      const memberUpdateHook = createEventHook<Parameters<RoomHooks['onMemberUpdate']>>()
      const memberTypingHook = createEventHook<Parameters<RoomHooks['onRoomMemberTyping']>>()
      const summaryHook = createEventHook<Parameters<RoomHooks['onSummary']>>()
      const timelineHook = createEventHook<Parameters<RoomHooks['onTimeline']>>()
      const timelineRefreshHook = createEventHook<Parameters<RoomHooks['onTimelineRefresh']>>()
      const timelineResetHook = createEventHook<Parameters<RoomHooks['onTimelineReset']>>()
      const localEchoUpdated = createEventHook<Parameters<RoomHooks['onLocalEchoUpdated']>>()
      const redactionHook = createEventHook<Parameters<RoomHooks['onRedaction']>>()

      const update = debounce(() => triggerRef(room), 50)
      watch(
        room,
        room => {
          if (!room) return

          room.on(RoomEvent.MyMembership, update)
          room.on(RoomStateEvent.Events, update)
          room.on(RoomEvent.AccountData, accountDataHook.trigger)
          room.on(RoomEvent.CurrentStateUpdated, currentStateUpdatedHook.trigger)
          room.on(RoomStateEvent.Members, memberUpdateHook.trigger)
          room.on(RoomEvent.Summary, summaryHook.trigger)
          room.on(RoomEvent.Timeline, timelineHook.trigger)
          room.on(RoomEvent.TimelineRefresh, timelineRefreshHook.trigger)
          room.on(RoomEvent.TimelineReset, timelineResetHook.trigger)
          room.on(RoomEvent.LocalEchoUpdated, localEchoUpdated.trigger)
          room.on(RoomEvent.Redaction, redactionHook.trigger)

          onWatcherCleanup(() => {
            room.off(RoomEvent.MyMembership, update)
            room.off(RoomStateEvent.Events, update)
            room.off(RoomEvent.AccountData, accountDataHook.trigger)
            room.off(RoomEvent.CurrentStateUpdated, currentStateUpdatedHook.trigger)
            room.off(RoomStateEvent.Members, memberUpdateHook.trigger)
            room.off(RoomEvent.Summary, summaryHook.trigger)
            room.off(RoomEvent.Timeline, timelineHook.trigger)
            room.off(RoomEvent.TimelineRefresh, timelineRefreshHook.trigger)
            room.off(RoomEvent.TimelineReset, timelineResetHook.trigger)
            room.off(RoomEvent.LocalEchoUpdated, localEchoUpdated.trigger)
            room.off(RoomEvent.Redaction, redactionHook.trigger)
          })
        },
        { immediate: true },
      )

      const { off: offTyping } = roomMemberTypingHook.on((event, member) => {
        if (member.roomId !== roomId) return
        memberTypingHook.trigger(event, member)
      })
      onScopeDispose(offTyping)

      const hooks: RoomEventHooks = {
        onAccountData: accountDataHook.on,
        onCurrentStateUpdated: currentStateUpdatedHook.on,
        onLocalEchoUpdated: localEchoUpdated.on,
        onMemberUpdate: memberUpdateHook.on,
        onRedaction: redactionHook.on,
        onRoomMemberTyping: memberTypingHook.on,
        onSummary: summaryHook.on,
        onTimeline: timelineHook.on,
        onTimelineRefresh: timelineRefreshHook.on,
        onTimelineReset: timelineResetHook.on,
      }

      return { hooks, room }
    })!

    entry = { hooks: instance.hooks, ref: instance.room, scope, subs: 0 }

    cache.set(key, entry)
  }
  entry.subs++
  return entry
}

function release(key: Key) {
  const entry = cache.get(key)
  if (!entry) return

  entry.subs--

  if (entry.subs <= 0) {
    entry.scope.stop()
    cache.delete(key)
  }
}

export function useRoomEffectScope(roomInput: MaybeRefOrGetter<MaybeRoomOrId | undefined>) {
  const inputRef = toRef(roomInput)
  const entryRef = shallowRef<Entry | undefined>()

  watch(
    inputRef,
    input => {
      if (!input) {
        entryRef.value = undefined
        return
      }

      const id = resolveRoomId(input)
      entryRef.value = acquire(id)

      onWatcherCleanup(() => release(id))
    },
    {
      immediate: true,
    },
  )

  return entryRef
}
