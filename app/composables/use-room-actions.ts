import type { InviteOpts, MatrixEvent, Room } from 'matrix-js-sdk'
import type { RoomMessageEventContent } from 'matrix-js-sdk/lib/types'
import type { LocationQueryValue } from 'vue-router'

import { EventStatus, EventType, KnownMembership, RelationType, RoomEvent } from 'matrix-js-sdk'

export function useRoomActions(
  roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>,
  eventOrId?: MaybeRefOrGetter<MaybeEventOrId | undefined>,
) {
  const room = useRoom(roomOrId)
  const roomId = useResolveRoomId(roomOrId)
  const eventId = useResolveEventId(eventOrId)
  const { client, saveClient } = useMatrixClient()
  const { notifyError } = useNotifications()
  const settings = useSettings()

  const react = useMutation({
    mutationFn: async (params: {
      event: MatrixEvent
      reaction?: string
      redact:
        | false
        | {
            reactionEvent: MatrixEvent
          }
    }) => {
      if (!room.value) return

      const { event, reaction, redact } = params

      const event_id = event.getId()
      if (!event_id) return

      if (redact) {
        const { reactionEvent } = redact
        let reactionEventId = reactionEvent.getId()

        if (reactionEvent.status === EventStatus.QUEUED || reactionEvent.status === EventStatus.NOT_SENT) {
          client.value.cancelPendingEvent(reactionEvent)
          return
        }

        if (reactionEvent.status === EventStatus.SENDING) {
          const awaited = await waitForEvent(room.value, reactionEvent)
          assert(awaited, 'failed to get reaction event after waiting for pending event to resolve')
          reactionEventId = awaited.getId()
        }

        assert(reactionEventId, 'reactionEventId was undefined when trying to redact reaction')

        await client.value.redactEvent(room.value!.roomId, reactionEventId)

        return
      }

      if (!reaction) return

      const isReacting = isUserReacting(room.value, event, client.value.getSafeUserId(), reaction)
      if (isReacting) return

      await client.value.sendEvent(room.value.roomId, EventType.Reaction, {
        'm.relates_to': {
          event_id,
          key: reaction,
          rel_type: RelationType.Annotation,
        },
      })
    },
    mutationKey: $mk.react(roomId),
  })

  const message = useMutation({
    mutationFn: async (eventContent: RoomMessageEventContent) => {
      if (!room.value) return
      return await client.value.sendMessage(room.value.roomId, eventContent)
    },
    mutationKey: $mk.message(roomId),
  })

  const typing = useMutation({
    mutationFn: async (params: { isTyping: boolean }) => {
      if (!room.value || (params.isTyping && !settings.value.messaging.typingEvents)) return false

      try {
        await client.value.sendTyping(room.value.roomId, params.isTyping, TYPING_TIMEOUT_MS)
        return true
      } catch {
        return false
      }
    },
  })

  const join = useMutation({
    mutationFn: async (opts: { via?: string[] | LocationQueryValue[] } | void) => {
      if (!roomId.value) return
      const { via: viaServers } = opts ?? {}

      const via = resolveViaArray(
        roomId.value,
        viaServers?.map(v => v?.toString()),
      )

      const res = await joinRoom(client.value, roomId.value, via)
      res.updateMyMembership(KnownMembership.Join)
      await saveClient()

      return res
    },
    mutationKey: $mk.joinRoom(roomId),
    onError: err => notifyError(err, `Failed to join ${room.value ? resolveRoomName(room.value) : 'room'}`),
  })

  const leave = useMutation({
    mutationFn: async () => {
      const currentRoom = room.value
      if (!currentRoom?.roomId) return

      const res = await client.value.leave(currentRoom.roomId)
      currentRoom.updateMyMembership(KnownMembership.Leave)
      await client.value.forget(currentRoom.roomId)
      await saveClient()

      return res
    },
    mutationKey: $mk.leaveRoom(roomId),
    onError: err => notifyError(err, `Failed to leave ${room.value ? resolveRoomName(room.value) : 'room'}`),
  })

  const invite = useMutation({
    mutationFn: async ({ opts, userId }: { userId: string; opts?: InviteOpts }) => {
      if (!room.value?.roomId) return
      return client.value.invite(room.value.roomId, userId, opts)
    },
    mutationKey: $mk.invite(roomId),
  })

  const optimisticallyRedacted = useOptimisticRedactions()
  const redact = useMutation({
    mutationFn: async (opts?: { reason?: string }) => {
      const { reason } = opts ?? {}
      if (!room.value || !eventId.value) return

      return client.value.redactEvent(room.value.roomId, eventId.value, undefined, { reason })
    },
    mutationKey: $mk.redact(roomId, eventId),
    onError: err => {
      optimisticallyRedacted.remove(eventId.value!)
      notifyError(err, 'Failed to delete message')
    },
    onMutate: () => optimisticallyRedacted.add(eventId.value!),
  })

  return {
    invite,
    join,
    leave,
    message,
    react,
    redact,
    typing,
  }
}

function waitForEvent(room: Room, event: MatrixEvent) {
  if (!event.status) return Promise.resolve()

  return new Promise<MatrixEvent>((resolve, reject) => {
    const onUpdate = (updatedEvent: MatrixEvent) => {
      if (updatedEvent.getId() !== event.getId()) return

      if (updatedEvent.status === EventStatus.SENT || isNull(updatedEvent.status)) {
        room.off(RoomEvent.LocalEchoUpdated, onUpdate)
        resolve(updatedEvent)
      } else if (updatedEvent.status === EventStatus.NOT_SENT || updatedEvent.status === EventStatus.CANCELLED) {
        room.off(RoomEvent.LocalEchoUpdated, onUpdate)
        reject(new $Error({ message: 'Event failed to send', title: 'Event failure' }))
      }
    }

    room.on(RoomEvent.LocalEchoUpdated, onUpdate)
  })
}
