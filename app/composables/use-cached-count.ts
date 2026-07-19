import { toRef } from '@vueuse/core'

export function useCachedCount(
  key: MaybeRefOrGetter<string>,
  count: MaybeRefOrGetter<number | undefined>,
  fallback: number,
) {
  const keyRef = toRef(key)
  const countRef = toRef(count)
  const cached = useLocalStorage<number | undefined>(() => `cacheCount:${keyRef.value}`, undefined)

  watchImmediate(countRef, value => {
    if (isDefined(value)) cached.value = value
  })

  return computed(() => Number(countRef.value ?? cached.value ?? fallback))
}
