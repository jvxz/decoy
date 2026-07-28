import type { HTMLAttributes, UnwrapRef } from 'vue'

export type { RemovableRef } from '@vueuse/core'

export type DefineClasses<T extends keyof any> = Partial<Record<T, HTMLAttributes['class']>>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type MaybeReadonlySet<T> = ReadonlySet<T> | Set<T>

export type MaybeRefsOrGetters<T extends object> = Prettify<{
  [K in keyof T]: MaybeRefOrGetter<UnwrapRef<T[K]>>
}>

export type DeepMaybeRefsOrGetters<T extends object> = Prettify<{
  [K in keyof T]: UnwrapRef<T[K]> extends object
    ? MaybeRefsOrGetters<UnwrapRef<T[K]>>
    : MaybeRefOrGetter<UnwrapRef<T[K]>>
}>

// https://github.com/nuxt/ui/blob/dde09d06486e68b1b4dd4538f91fefd08a3d7548/src/runtime/types/utils.ts#L125-L129
export type EmitsToProps<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: T[K] extends [...args: infer Args] ? (...args: Args) => void : never
}

export type AsideDisplayMode = keyof typeof ASIDE_DISPLAY_MODES
