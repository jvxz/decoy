import { useIsFetching } from '@tanstack/vue-query'

type FetchFactory<K extends $QKKey> = (typeof $qk)[K]
type FetchParams<K extends $QKKey> = FetchFactory<K> extends (...args: infer P) => unknown ? P : never

export const useIsKeyFetching = <T extends $QKKey>(qkKey: T, ...params: FetchParams<T>) => {
  const factory = $qk[qkKey] as (...params: FetchParams<T>) => ReturnType<FetchFactory<T>>
  const num = useIsFetching(computed(() => ({ queryKey: factory(...params) })))
  return computed(() => !!num.value)
}
