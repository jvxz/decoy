export const useOptimisticRedactions = createGlobalState(() => {
  const redacted = shallowReactive(new Set<string>())

  function add(id: string) {
    redacted.add(id)
  }
  function remove(id: string) {
    redacted.delete(id)
  }
  function has(id: string) {
    return redacted.has(id)
  }

  return { add, has, remove }
})
