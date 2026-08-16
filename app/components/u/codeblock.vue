<script lang="ts" setup>
import type { ShjLanguage } from 'rangi'

import { codeToHtml } from 'rangi'
import { catppuccinMocha } from 'rangi/themes'

import type { UCardProps } from './card/index.vue'

export interface UCodeblockRootProps extends UCardProps {
  lang?: ShjLanguage | (string & {})
  input: string
  dialog?: boolean
  header?: boolean
  padding?: number
  numbers?: boolean
  copy?: boolean
  ui?: DefineClasses<'root' | 'header' | 'copyButton' | 'container'>
}

const props = withDefaults(defineProps<UCodeblockRootProps>(), {
  copy: true,
  dialog: true,
  header: false,
  numbers: true,
  padding: 4,
})

const { openDialog } = useGlobalDialog()

const delegated = reactiveOmit(props, 'class')

const formattedInput = computed(() => props.input.trim().replace(TRAILING_NEWLINE_RE, ''))
const code = computed(() =>
  codeToHtml(formattedInput.value, { classes: true, lang: props.lang, theme: catppuccinMocha }),
)

const codeContainer = useTemplateRef('code')
const codeRoot = computed(() => codeContainer.value?.firstChild as HTMLElement | undefined)
const resolvedLang = computed(() => codeRoot.value?.dataset.lang)

const { isYOverflowed } = useElementOverflow(codeRoot)
</script>

<template>
  <UCard
    v-bind="delegated"
    data-slot="codeblock-root"
    :class="cn('p-0 bg-surface gap-0 shadow-none text-sm overflow-clip', props.class, ui?.root)"
    :style="{
      '--_padding': `calc(var(--spacing) * ${props.padding})`,
      '--_numbers-display': props.numbers ? '' : 'none',
    }"
  >
    <header
      v-if="header"
      :class="
        cn('w-full overflow-clip shrink-0 h-8 flex items-center justify-between px-2 font-mono text-xs', ui?.header)
      "
    >
      <span class="ps-1 select-none">{{ resolvedLang }}</span>

      <div class="flex gap-px items-center">
        <UButton
          v-if="dialog"
          title="View in dialog"
          size="icon-xs"
          variant="ghost"
          @click="openDialog('codeViewer', { code: formattedInput, lang: resolvedLang })"
        >
          <Icon name="tabler:code" />
        </UButton>

        <UCopyButton v-if="copy" size="icon-xs" :value="formattedInput" />

        <slot name="header-buttons" />
      </div>
    </header>

    <div
      :class="
        cn(
          'bg-codeblock rounded select-auto relative bg-background flex flex-col flex-1 min-h-0',
          header && 'border-t',
          ui?.container,
        )
      "
    >
      <UCopyButton
        v-if="props.copy && !props.header"
        size="icon-sm"
        :value="formattedInput"
        :class="
          cn('absolute top-2 opacity-50 hover:opacity-100', isYOverflowed ? 'right-4.5' : 'right-2', ui?.copyButton)
        "
      />

      <div ref="code" class="contents" v-html="code" />
    </div>
  </UCard>
</template>

<style>
.shj {
  @apply font-mono whitespace-pre overflow-auto scrollbar-fancy flex-1 min-h-0;
  padding: var(--_padding);
}

.shj-scroll {
  @apply flex min-h-full;
}

.shj-numbers {
  @apply text-right pr-3 pl-2 opacity-50 select-none;
  display: var(--_numbers-display);
}

.shj-code {
  @apply flex-1 outline-none;
}

.shj-kwd {
  color: #cba6f7;
}
.shj-section {
  color: #89b4fa;
}
.shj-str {
  color: #a6e3a1;
}
.shj-num {
  color: #fab387;
}
.shj-bool {
  color: #fab387;
}
.shj-func {
  color: #89b4fa;
}
.shj-class {
  color: #f9e2af;
}
.shj-type {
  color: #f9e2af;
}
.shj-cmnt {
  color: #9399b2;
}
.shj-oper {
  color: #94e2d5;
}
.shj-bracket {
  color: #9399b2;
}
.shj-var {
  color: #cdd6f4;
}
.shj-err {
  color: #f38ba8;
}
.shj-deleted {
  color: #f38ba8;
}
.shj-insert {
  color: #a6e3a1;
}
</style>
