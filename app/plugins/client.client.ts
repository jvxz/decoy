export default defineNuxtPlugin({
  parallel: true,
  setup: async () => {
    const { loginPersisted } = useAuth()
    const clientStore = useClientStore()

    const persistedClient = await loginPersisted()

    if (persistedClient)
      clientStore.client = persistedClient
  },
})
