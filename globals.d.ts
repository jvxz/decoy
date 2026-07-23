declare module '#app' {
  interface PageMeta {
    requiresAuth?: boolean
  }
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    colorModes: string[]
  }
}

export {}
