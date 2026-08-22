type Params = Partial<RoomHooks>

export function useRoomHooks(roomInput: MaybeRefOrGetter<MaybeRoomOrId | undefined>, params: Params) {
  const roomEffectScope = useRoomEffectScope(roomInput)

  watch(
    roomEffectScope,
    roomEffectScope => {
      if (!roomEffectScope) return

      const { hooks } = roomEffectScope
      const disposers: (() => void)[] = []

      function bindListener<T extends keyof RoomHooks>(key: T) {
        const cb = params[key]
        if (!cb) return

        const hook = hooks[key] as (callback: typeof cb) => { off: () => void }

        const { off } = hook(cb)
        disposers.push(off)
      }

      bindListener('onAccountData')
      bindListener('onCurrentStateUpdated')
      bindListener('onMemberUpdate')
      bindListener('onRoomMemberTyping')
      bindListener('onSummary')
      bindListener('onTimeline')
      bindListener('onTimelineRefresh')
      bindListener('onRedaction')
      bindListener('onTimelineReset')

      onWatcherCleanup(() => disposers.forEach(d => d()))
    },
    { immediate: true },
  )
}
