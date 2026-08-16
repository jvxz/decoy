<script lang="ts" setup>
import type { Transition } from 'motion-v'
import type { HTMLAttributes } from 'vue'

import { motion } from 'motion-v'

import type { ButtonProps } from './button.vue'

export interface UCopyButtonProps extends ButtonProps {
  class?: HTMLAttributes['class']
  value: MaybeRefOrGetter<string | undefined>
}

const props = withDefaults(defineProps<UCopyButtonProps>(), {
  size: 'icon',
  variant: 'ghost',
})

const animate = { opacity: 1, scale: 1 }
const exit = { opacity: 0, scale: 0.5 }
const initial = { opacity: 0, scale: 0.5 }
const transition: Transition = { duration: 0.15, ease: [0.25, 0, 0.06, 1] }

const copied = ref(false)
const { copy } = useClipboard()

const { start } = useTimeoutFn(() => {
  copied.value = false
}, 1000)

function copyValue(value: string) {
  copy(value)
  copied.value = true
  start()
}

const delegated = reactiveOmit(props, ['class', 'value'])
</script>

<template>
  <UButton
    v-bind="delegated"
    :title="$attrs.title ?? 'Click to copy'"
    :aria-label="copied ? 'Copied' : 'Copy'"
    :disabled="copied"
    data-slot="copy-button"
    :class="cn(copied && !disabled && 'disabled:opacity-100', props.class)"
    @click="copyValue(toValue(props.value) ?? '')"
  >
    <AnimatePresence :initial="false" mode="sync">
      <motion.div
        v-if="copied"
        :initial="initial"
        :animate="animate"
        :exit="exit"
        :transition="transition"
        class="size-fit aspect-square absolute"
      >
        <Icon name="tabler:check" class="text-foreground" />
      </motion.div>
      <motion.div
        v-else
        :initial="initial"
        :animate="animate"
        :exit="exit"
        :transition="transition"
        class="size-fit aspect-square absolute"
      >
        <Icon name="tabler:copy" />
      </motion.div>
    </AnimatePresence>
  </UButton>
</template>
