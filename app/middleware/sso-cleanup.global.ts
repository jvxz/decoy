export default defineNuxtRouteMiddleware(async to => {
  if (import.meta.server) return
  if (to.name !== 'login-sso') {
    // no need to await this, just cleanup
    void idb.remove(SSO_BASE_URL_KEY)
  }
})
