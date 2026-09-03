interface AppNotificationGeneric {
  title: string
  description?: string
  icon?: string
}

export interface AppNotificationRegions {
  generic: AppNotificationGeneric
  invite: {
    roomId: string
  }
  error: AppNotificationGeneric & { raw?: string }
}

export interface AppNotification<T extends AppNotificationName = AppNotificationName> {
  id: string
  timestamp: number
  key: T
  payload: AppNotificationRegions[T]
}

export type AppNotificationName = keyof AppNotificationRegions
