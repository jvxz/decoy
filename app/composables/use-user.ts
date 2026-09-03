import type { ComputedWithControlRef } from '@vueuse/core'

import { toRef } from '@vueuse/core'
import { User } from 'matrix-js-sdk'

export function useUser<Assert = false>(
  maybeUserOrId: MaybeRefOrGetter<MaybeUserOrId | undefined | null>,
): Assert extends true ? ComputedWithControlRef<User> : ComputedWithControlRef<User | null> {
  const userInputRef = toRef(maybeUserOrId)
  const { client } = useMatrixClient()

  const user = computedWithControl([client, userInputRef], () => {
    if (userInputRef.value instanceof User) return userInputRef.value
    return isNil(userInputRef.value) ? null : client.value.getUser(resolveUserId(userInputRef.value))
  })

  return user as Assert extends true ? ComputedWithControlRef<User> : ComputedWithControlRef<User | null>
}
