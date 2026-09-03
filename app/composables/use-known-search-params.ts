export interface KnownSearchParams {
  via?: string | string[]
}

export const useKnownSearchParams = createGlobalState(() => computed(() => useRoute().query as KnownSearchParams))
