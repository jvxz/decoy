<script lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export interface ClickToCopyProps extends PrimitiveProps {
  text?: string
  class?: HTMLAttributes['class']
  withTitle?: boolean
  copiedDuration?: number
}
</script>

<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ClickToCopyProps>(), {
  as: 'button',
  copiedDuration: 1000,
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
      <Transition name="copied">
        <div
          v-if="copied"
          :class="
            cn(
              'absolute pointer-events-none flex items-center copied-anim gap-1 inset-0 -top-1.5em size-fit',
              props.class,
            )
          "
        >
          <span class="text-sm"> Copied </span>
          <Icon name="tabler:check" class="text-foreground size-0.8em" />
        </div>
      </Transition>
    </slot>
  </span>
</template>

<style>
.copied-enter-active,
.copied-leave-active {
  transition: all 150ms;
  @apply ease-snappy;
}

.copied-enter-to,
.copied-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.copied-enter-from {
  opacity: 0;
  transform: translateY(25%);
}

.copied-leave-to {
  opacity: 0;
  transform: translateY(-25%);
}
</style>
