import type { MatrixEvent } from 'matrix-js-sdk'

import { map } from 'es-toolkit/set'

export const useRoomEventReactions = createProvidableComposable(
  'useRoomEventReactions',
  (roomOrId: MaybeRefOrGetter<MaybeRoomOrId | undefined>, eventOrId: MaybeRefOrGetter<MatrixEvent | undefined>) => {
    const room = useRoom(roomOrId)
    const event = useRoomLiveEvent(roomOrId, eventOrId)
    const { bumpRecentReaction } = useRecentReactions()

    const reactions = computed(() => {
      if (!room.value || !event.value) return

      const eventId = event.value.getId()
      assert(eventId, 'eventId was undefined when getting event reactions')

      return getEventReactions(room.value, eventId)
    })

    const { self } = useSelf()
    function isReactingTo(reaction: string) {
      if (!self.value) return
      return isUserReactingTo(self.value, reaction)
    }

    const { react } = useRoomActions(room)
    const pendingRedaction = new Map<string, string>()

    const getDebouncedReactFn = memoize((key: string) =>
      throttle(
        async (shouldReact: boolean) => {
          if (!event.value || !REACTABLE_EVENT_TYPES.includes(event.value.getType())) return

          if (shouldReact) {
            const reactionEvent = isReactingTo(key)
            if (reactionEvent) {
              const reactionEventId = reactionEvent.getId()!

              if (pendingRedaction.get(key) !== reactionEventId) {
                pendingRedaction.set(key, reactionEventId)

                try {
                  await react.mutateAsync({ event: event.value, redact: { reactionEvent } })
                } finally {
                  pendingRedaction.delete(key)
                }
              }
            }

            await react.mutateAsync({ event: event.value, reaction: key, redact: false })
            bumpRecentReaction(key)
          } else {
            const reactionEvent = isReactingTo(key)
            if (!reactionEvent) return

            const id = reactionEvent.getId()!
            if (pendingRedaction.get(key) === id) return

            pendingRedaction.set(key, id)
            try {
              await react.mutateAsync({ event: event.value, redact: { reactionEvent } })
            } finally {
              pendingRedaction.delete(key)
            }
          }
        },
        400,
        { edges: ['leading', 'trailing'] },
      ),
    )

    function reactTo(reaction: string, shouldReact = true) {
      if (!event.value || !room.value) return

      const eventId = event.value.getId()
      assert(eventId, `eventId was undefined when toggling reaction to ${reaction}`)

      getDebouncedReactFn(reaction)(shouldReact)
    }

    function isUserReactingTo(user: MaybeUserOrId, reaction: string) {
      if (!room.value || !event.value) return

      return isUserReacting(room.value, event.value, user, reaction)
    }

    const getReactors = (reaction: string) => {
      if (!room.value || !event.value) return

      const reactions = getEventReactions(room.value, event.value)
      const reactionEvents = reactions?.get(reaction)
      if (!reactionEvents) return

      return map(reactionEvents, e => e.getSender()!)
    }

    return {
      error: react.error,
      event,
      getReactors,
      isReactingTo,
      isUserReactingTo,
      reactTo,
      reactions,
      room,
    }
  },
)
