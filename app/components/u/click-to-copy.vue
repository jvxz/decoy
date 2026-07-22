<script lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface ClickToCopyProps extends PrimitiveProps {
  text?: string
  class?: HTMLAttributes['class']
  withTitle?: boolean
  copiedDuration?: number
  side?: 'top' | 'bottom' | 'left' | 'right'
}
</script>

<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ClickToCopyProps>(), {
  as: 'button',
  copiedDuration: 1000,
  side: 'top',
  withTitle: true,
})

const emit = defineEmits<{ copy: [text: string] }>()

const { polite } = useAnnouncer()

const el = useTemplateRef('el')
const { copied, copy } = useClipboard({ copiedDuring: props.copiedDuration, legacy: true })

async function onCopy() {
  const text = props.text ?? unrefElement(el)?.textContent?.trim() ?? ''
  if (!text) return

  await copy(text)
  emit('copy', text)
  polite('Copied text')
}

defineExpose({ copied, copy: onCopy })
</script>

<template>
  <span class="inline-flex size-fit relative">
    <Primitive
      ref="el"
      v-bind="$attrs"
      :as
      :as-child
      :data-copied="copied ? '' : undefined"
      class="cursor-pointer"
      :title="withTitle ? 'Click to copy' : undefined"
      @click="onCopy"
    >
      <slot :copied :copy="onCopy" />
    </Primitive>

    <slot name="overlay" :copied :copy="onCopy">
      <Presence v-slot="{ present }" :present="copied">
        <div
          v-show="present"
          :data-state="copied ? 'open' : 'closed'"
          :data-side="side"
          :class="
            cn(
              'absolute text-sm pointer-events-none flex items-center gap-1 inset-0 size-fit',
              'data-[state=open]:(animate-in fade-in)',
              'data-[state=closed]:(animate-out fade-out)',
              'data-[side=top]:(-top-1.5em data-[state=open]:slide-in-b-1 data-[state=closed]:slide-out-t-1)',
              'data-[side=bottom]:(top-2em data-[state=open]:slide-in-t-1 data-[state=closed]:slide-out-b-1)',
              'data-[side=left]:(top-1/2 -translate-y-1/2 -left-150% data-[state=open]:slide-in-r-1 data-[state=closed]:slide-out-l-1)',
              'data-[side=right]:(top-1/2 -translate-y-1/2 left-110% data-[state=open]:slide-in-l-1 data-[state=closed]:slide-out-r-1)',
              props.class,
            )
          "
        >
          <span>Copied</span>
          <Icon name="tabler:check" class="text-foreground size-1em" />
        </div>
      </Presence>
    </slot>
  </span>
</template>
