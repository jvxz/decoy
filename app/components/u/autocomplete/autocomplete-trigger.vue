<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn, interactiveStyles } from '#imports'
import { AutocompleteTrigger, useForwardProps } from 'reka-ui'

const props = withDefaults(
  defineProps<ComboboxTriggerProps & { class?: HTMLAttributes['class'], size?: 'sm' | 'default' }>(),
  { size: 'default' },
)

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <AutocompleteTrigger
    data-slot="autocomplete-trigger"
    :data-size="size"
    v-bind="forwarded"
    :class="cn(
      interactiveStyles.base,
      interactiveStyles.variant.ghost,
      interactiveStyles.size.icon,
      'mr-2',
      props.class,

    )"
  >
    <slot>
      <Icon name="mingcute:down-line" class="text-muted-foreground translate-y-0.5 size-3.5!" />
    </slot>
  </AutocompleteTrigger>
</template>
