export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  const clientStore = useClientStore()
  const unauthed = clientStore.client.isGuest()

  if (unauthed && to.path.includes('/app'))
    return navigateTo('/login')

  if (!unauthed && to.path.includes('/login'))
    return navigateTo('/app')
})
