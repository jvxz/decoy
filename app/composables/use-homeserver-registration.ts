import type { MatrixError, UIAFlow } from 'matrix-js-sdk'

export function useHomeserverRegistration(
  homeserverUrl: MaybeRefOrGetter<string | undefined>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  const homeserverUrlRef = toRef(homeserverUrl)
  const enabledRef = toRef(enabled)

  const query = useQuery<UIAFlow[] | null | undefined, RegistrationDisabledError | MatrixError>({
    enabled: enabledRef,
    queryFn: async () => {
      const url = homeserverUrlRef.value
      if (!url) return null

      return getRegistrationFlows(url)
    },
    queryKey: $qk.homeserverRegistrationFlows(homeserverUrlRef),
    retry: false,
    staleTime: Infinity,
  })

  const registrationDisabled = computed(() => query.error.value instanceof RegistrationDisabledError)

  return {
    registrationDisabled,
    ...query,
  }
}
