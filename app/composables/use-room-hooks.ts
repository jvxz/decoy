import type {
  Listener,
  MatrixEvent,
  RoomEmittedEvents,
  RoomEventHandlerMap,
  RoomMember,
  RoomStateEvent,
} from 'matrix-js-sdk'

import { RoomEvent } from 'matrix-js-sdk'

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

type DirectRoomHooks = Omit<
  RoomHooks,
  | 'onAccountData'
  | 'onLocalEchoUpdated'
  | 'onMemberUpdate'
  | 'onRedaction'
  | 'onRoomMemberTyping'
  | 'onTimeline'
  | 'onTimelineReset'
>

const eventMap: { [K in keyof DirectRoomHooks]: RoomEmittedEvents } = {
  onCurrentStateUpdated: RoomEvent.CurrentStateUpdated,
  onSummary: RoomEvent.Summary,
  onTimelineRefresh: RoomEvent.TimelineRefresh,
}

export function useRoomHooks(roomInput: MaybeRefOrGetter<MaybeRoomOrId | undefined>, params: Partial<RoomHooks>) {
  const room = useRoom(roomInput)
  const {
    onRoomAccountData,
    onRoomLocalEchoUpdated,
    onRoomMembers,
    onRoomMemberTyping,
    onRoomRedaction,
    onRoomTimeline,
    onRoomTimelineReset,
  } = useMatrixHooks()

  const {
    onAccountData,
    onLocalEchoUpdated,
    onMemberUpdate,
    onRedaction,
    onRoomMemberTyping: onMemberTyping,
    onTimeline,
    onTimelineReset,
    ...directHooks
  } = params

  watchImmediate(room, room => {
    if (!room) return

    const offs: (() => void)[] = []

    for (const key of objectKeys(directHooks) as (keyof DirectRoomHooks)[]) {
      const callback = directHooks[key]
      if (!callback) continue

      const event = eventMap[key]

      room.on(event, callback)
      offs.push(() => room.off(event, callback))
    }

    onWatcherCleanup(() => offs.forEach(f => f()))
  })

  if (onTimeline) {
    onRoomTimeline((...args) => {
      if (args[1]?.roomId !== room.value?.roomId) return
      onTimeline(...args)
    })
  }

  if (onTimelineReset) {
    onRoomTimelineReset((...args) => {
      if (args[0]?.roomId !== room.value?.roomId) return
      onTimelineReset(...args)
    })
  }

  if (onLocalEchoUpdated) {
    onRoomLocalEchoUpdated((...args) => {
      if (args[1].roomId !== room.value?.roomId) return
      onLocalEchoUpdated(...args)
    })
  }

  if (onAccountData) {
    onRoomAccountData((...args) => {
      if (args[1].roomId !== room.value?.roomId) return
      onAccountData(...args)
    })
  }

  if (onMemberUpdate) {
    onRoomMembers((...args) => {
      if (args[1].roomId !== room.value?.roomId) return
      onMemberUpdate(...args)
    })
  }

  if (onRedaction) {
    onRoomRedaction((...args) => {
      if (args[1].roomId !== room.value?.roomId) return
      onRedaction(...args)
    })
  }

  if (onMemberTyping) {
    onRoomMemberTyping((event, member) => {
      if (member.roomId !== room.value?.roomId) return
      onMemberTyping(event, member)
    })
  }
}
