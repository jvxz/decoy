import type { MatrixClient, TokenRefreshFunction } from 'matrix-js-sdk'

import { createClient, IndexedDBCryptoStore, IndexedDBStore, MatrixError, TokenRefreshLogoutError } from 'matrix-js-sdk'

const getCryptoDbName = (userId: string) => `${userId}-crypto`

export async function createAuthedClient(auth: AuthPayload) {
  assert(!!auth.userId, 'No user ID found in auth payload when creating authed client')

  const idbStore = new IndexedDBStore({
    dbName: auth.userId,
    indexedDB,
    workerFactory: () => new Worker(new URL('./idb-worker.ts', import.meta.url), { type: 'module' }),
  })

  const cryptoDbName = getCryptoDbName(auth.userId)

  const idbLegacyCryptoStore = new IndexedDBCryptoStore(indexedDB, cryptoDbName)

  const client = createClient({
    accessToken: auth.accessToken,
    baseUrl: auth.baseUrl,
    cryptoStore: idbLegacyCryptoStore,
    deviceId: auth.deviceId,
    refreshToken: auth.refreshToken,
    store: idbStore,
    timelineSupport: true,
    tokenRefreshFunction: createTokenRefreshFunction(),
    userId: auth.userId,
  })

  await idbStore.startup()
  await client.initRustCrypto({ cryptoDatabasePrefix: cryptoDbName })

  await messageSw('session', {
    accessToken: auth.accessToken,
    baseUrl: auth.baseUrl,
  })

  client.setMaxListeners(50)

  return client
}

function createTokenRefreshFunction(): TokenRefreshFunction {
  return async (refreshToken: string) => {
    try {
      const auth = await idb.getItem<AuthPayload>('auth')
      if (!auth) throw new TokenRefreshLogoutError()

      const tempClient = createTempClient(normalizeHomeserverUrl(auth.baseUrl), {
        accessToken: auth.accessToken,
        refreshToken,
      })
      const refreshed = await tempClient.refreshToken(refreshToken)

      const expiresAt = refreshed.expires_in_ms ? Date.now() + refreshed.expires_in_ms : undefined

      const payload = {
        ...auth,
        accessToken: refreshed.access_token,
        expiresAt,
        refreshToken: refreshed.refresh_token,
      }
      await idb.setItem<AuthPayload>('auth', payload)
      await messageSw('session', {
        accessToken: payload.accessToken,
        baseUrl: payload.baseUrl,
      })

      return {
        accessToken: refreshed.access_token,
        expiry: expiresAt ? new Date(expiresAt) : undefined,
        refreshToken: refreshed.refresh_token,
      }
    } catch (error) {
      if (error instanceof TokenRefreshLogoutError) throw error

      if (error instanceof MatrixError) {
        if (error.isRateLimitError()) throw error

        if (error.errcode === 'M_UNKNOWN_TOKEN') {
          console.error('Unknown refresh token. Client will be unable to refresh')
          throw new TokenRefreshLogoutError()
        }
        throw error
      }
      throw error
    }
  }
}

export function startClient(client: MatrixClient) {
  return client.startClient({
    initialSyncLimit: 8,
    lazyLoadMembers: true,
    threadSupport: true,
  })
}

export async function logoutClient(client: MatrixClient) {
  await messageSw('session', {})
  await messageSw('cache', {
    action: 'evict',
    cacheName: 'media',
    urls: 'all',
  })

  client.stopClient()

  await client.logout().catch(() => {})

  await client.clearStores({ cryptoDatabasePrefix: getCryptoDbName(client.getSafeUserId()) })
  await idb.clear()

  return reloadNuxtApp({ path: '/' })
}

export async function resetClientData(client: MatrixClient) {
  client.stopClient()
  await client.store.deleteAllData()
}
export function getCryptoSafe(client: MatrixClient) {
  const crypto = client.getCrypto()
  assert(crypto, '`crypto` was undefined')

  return crypto
}
