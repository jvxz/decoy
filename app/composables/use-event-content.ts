import type { IContent, MatrixEvent } from 'matrix-js-sdk'

export function useEventContent<T extends IContent = IContent>(event: MaybeRefOrGetter<MatrixEvent | undefined>) {
  const eventRef = toRef(event)
  const version = computed(() => getEventVersion(eventRef.value?.getId()))

  const content = computed(() => {
    void version.value
    return eventRef.value?.getContent<T>()
  })

  const isDecrypting = computed(() => {
    void version.value
    return eventRef.value?.isBeingDecrypted() ?? false
  })

  const isRedacted = computed(() => {
    void version.value
    return eventRef.value?.isRedacted()
  })

  return { content, isDecrypting, isRedacted }
}
