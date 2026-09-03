import type { IMatrixProfile, User, UserEventHandlerMap } from 'matrix-js-sdk'
import type { EffectScope, ShallowRef } from 'vue'

import { UserEvent } from 'matrix-js-sdk'

interface Entry {
  scope: EffectScope
  ref: ShallowRef<IMatrixProfile | undefined>
  subs: number
}

const cache = new Map<string, Entry>()

function acquire(key: string) {
  let entry = cache.get(key)
  if (!entry) {
    const scope = effectScope(true)

    const ref = scope.run(() => {
      const userId = key
      const { client } = useMatrixClient()
      const { onEvent, onUserProfile } = useMatrixHooks()

      const user = shallowRef<User | undefined>(client.value.getUser(userId) ?? undefined)

      const profile = shallowRef<IMatrixProfile | undefined>({
        avatar_url: user.value?.avatarUrl,
        displayname: user.value?.rawDisplayName ?? getDisplayNameFallback(userId),
      })

      let writes = 0
      function setProfile(next: IMatrixProfile) {
        writes++
        profile.value = next
      }

      function fetchProfile() {
        const at = ++writes
        client.value
          .getProfileInfo(userId)
          .then(result => {
            if (result && writes === at) profile.value = result
          })
          .catch(() => {})
      }

      const refetchProfile = useDebounceFn(fetchProfile, 500)

      if (!user.value) fetchProfile()

      const updateProfile: UserEventHandlerMap[UserEvent.AvatarUrl | UserEvent.DisplayName] = (_, user) => {
        setProfile({
          avatar_url: user.avatarUrl,
          displayname: user.rawDisplayName ?? getDisplayNameFallback(userId),
        })
      }

      onEvent(event => {
        if (user.value) return
        if (event.getType() !== 'm.room.member') return
        if (event.getStateKey() !== userId) return

        const resolved = client.value.getUser(userId)

        if (!resolved) {
          refetchProfile()
          return
        }

        user.value = resolved

        setProfile({
          avatar_url: resolved.avatarUrl,
          displayname: resolved.rawDisplayName ?? getDisplayNameFallback(userId),
        })

        resolved.on(UserEvent.AvatarUrl, updateProfile)
        resolved.on(UserEvent.DisplayName, updateProfile)
      })

      onUserProfile((updatedUserId, updatedProfile) => {
        if (updatedUserId !== userId) return

        setProfile({
          ...profile.value,
          avatar_url: updatedProfile?.avatar_url as string | undefined,
          displayname: (updatedProfile?.displayname as string | undefined) ?? getDisplayNameFallback(userId),
        })
      })

      user.value?.on(UserEvent.AvatarUrl, updateProfile)
      user.value?.on(UserEvent.DisplayName, updateProfile)

      onScopeDispose(() => {
        user.value?.off(UserEvent.AvatarUrl, updateProfile)
        user.value?.off(UserEvent.DisplayName, updateProfile)
      })

      return profile
    })!

    entry = { ref, scope, subs: 0 }

    cache.set(key, entry)
  }
  entry.subs++
  return entry
}

function release(key: string) {
  const entry = cache.get(key)
  if (!entry) return

  entry.subs--

  if (entry.subs <= 0) {
    entry.scope.stop()
    cache.delete(key)
  }
}

export function useUserProfile(user: MaybeRefOrGetter<MaybeUserOrId | undefined>) {
  const userRef = computed(() => {
    const u = toValue(user)
    if (u) return resolveUserId(u)
  })
  const current = shallowRef<Entry | undefined>(undefined)

  watch(
    userRef,
    (key, _, onCleanup) => {
      if (!key) {
        current.value = undefined
        return
      }

      const entry = acquire(key)
      current.value = entry

      onCleanup(() => release(key))
    },
    { immediate: true },
  )

  return computed(() => current.value?.ref.value)
}
