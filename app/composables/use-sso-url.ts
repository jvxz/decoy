import type { SSOAction } from 'matrix-js-sdk'

import { createClient } from 'matrix-js-sdk'

export const useSsoUrl = (
  resolvedHomeserverUrl: MaybeRefOrGetter<string | undefined>,
  redirectUrl: MaybeRefOrGetter<string>,
  opts: {
    loginType?: MaybeRefOrGetter<string | undefined>
    idpId?: MaybeRefOrGetter<string | undefined>
    action?: MaybeRefOrGetter<SSOAction | undefined>
  } = {},
) => {
  const resolvedHomeserverUrlRef = toRef(resolvedHomeserverUrl)
  const redirectUrlRef = toRef(redirectUrl)

  const client = computed(() =>
    resolvedHomeserverUrlRef.value ? createClient({ baseUrl: resolvedHomeserverUrlRef.value }) : undefined,
  )

  return computed(() => {
    if (!resolvedHomeserverUrlRef.value) return

    return client.value?.getSsoLoginUrl(
      redirectUrlRef.value,
      toValue(opts.loginType),
      toValue(opts.idpId),
      toValue(opts.action),
    )
  })
}
