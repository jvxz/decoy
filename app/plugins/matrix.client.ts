import { createClient, MemoryStore, SyncState, User } from 'matrix-js-sdk'

export default defineNuxtPlugin({
  name: 'matrix',
  order: 0,
  parallel: true,
  setup: () => {
    const status = useMatrixStatus()
    const { onSync, onLogout } = useMatrixHooks()
    const { client, initAuthedClient } = useMatrixClient()
    const { logout } = useAuth()
    // always ready in e2e tests
    const ready = ref(isTestMode())

    const init = async () => {
      try {
        if (isAuthMocked()) {
          const mockedAuth = getMockedAuth()
          const userId = mockedAuth?.userId ?? '@test:localhost'
          const store = new MemoryStore()

          client.value = createClient({
            accessToken: mockedAuth?.accessToken ?? 'test-token',
            baseUrl: mockedAuth?.baseUrl ?? MATRIX_BASE_URL,
            deviceId: mockedAuth?.deviceId ?? 'TEST_DEVICE',
            store,
            userId,
          })
          store.storeUser(new User(userId))

          status.value.isAuthed = true
          status.value.isDataSynced = true

          return
        }

        status.value.isStarting = true
        status.value.isDataSynced = false

        const authPayload = await idb.get<AuthPayload>('auth')
        if (authPayload) {
          const authedClient = await initAuthedClient(false)
          if (!authedClient) logoutClient(client.value)
          else status.value.isAuthed = true
        }
      } finally {
        const router = useRouter()
        const route = useRoute()

        status.value.isStarting = false

        if (!status.value.isAuthed && route.meta.requiresAuth) await router.replace('/login')
        else if (status.value.isAuthed && route.name === 'login') await router.replace('/app')
      }
    }

    // process isDataSynced status when client changes
    onSync((syncState, _prevState) => {
      if (syncState === SyncState.Prepared) {
        status.value.isDataSynced = true
        ready.value = true
      }
    })

    onLogout(() => logout.executeImmediate())

    void init()

    return {
      provide: {
        ready,
      },
    }
  },
})
