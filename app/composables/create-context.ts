// forked from https://github.com/unovue/reka-ui/blob/6e340d667436ea4c5a9c32e484c9c604ef901754/packages/core/src/shared/createContext.ts under MIT
// replace `Symbol(symbolDescription)` with `Symbol.for(symbolDescription)` + drop 2nd param + make `providerComponentName` string-only
// `Symbol.for` because plain `Symbol` breaks in dev with HMR

import type { InjectionKey } from 'vue'

import { inject, provide } from 'vue'

export function createContext<ContextValue>(providerComponentName: string) {
  const symbolDescription = `${providerComponentName}Context`

  const injectionKey: InjectionKey<ContextValue | null> = Symbol.for(symbolDescription)

  const injectContext = <T extends ContextValue | null | undefined = ContextValue>(
    fallback?: T,
  ): T extends null ? ContextValue | null : ContextValue => {
    const context = inject(injectionKey, fallback)
    if (context) return context

    if (context === null) return context as any

    throw new Error(
      `Injection \`${injectionKey.toString()}\` not found. Component must be used within \`${`${providerComponentName}`}\``,
    )
  }

  const provideContext = (contextValue: ContextValue) => {
    provide(injectionKey, contextValue)
    return contextValue
  }

  return [injectContext, provideContext] as const
}
