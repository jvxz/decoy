export type DefineClasses<T extends keyof any> = Partial<Record<T, string>>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
