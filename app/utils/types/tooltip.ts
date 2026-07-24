export interface TooltipRegions {
  timestamp: {
    datetime: string | number
  }
  deviceListVerifiedIcon: {
    verified: boolean | undefined
  }
}

export type TooltipName = keyof TooltipRegions
