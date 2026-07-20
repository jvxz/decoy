export interface TooltipRegions {
  timestamp: {
    datetime: string | number
  }
}

export type TooltipName = keyof TooltipRegions
