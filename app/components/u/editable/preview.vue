<script lang="ts" setup>
import type { EditablePreviewProps } from 'reka-ui'

import { injectEditableRootContext } from 'reka-ui'

import { editableAreaLeadingIconInjectionKey } from './area.vue'

export type UEditablePreviewProps = EditablePreviewProps & { class?: string }

const props = defineProps<UEditablePreviewProps>()

const { modelValue } = injectEditableRootContext()
const leadingIcon = inject(editableAreaLeadingIconInjectionKey)

const delegated = reactiveOmit(props, ['class'])
</script>

<template>
  <EditablePreview
    v-bind="delegated"
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'text-base px-1 font-normal py-0 text-foreground underline decoration-dotted',
        props.class,
      )
    "
    data-slot="editable-preview"
  >
    <slot>
      <Icon v-if="leadingIcon" :name="leadingIcon" class="shrink-0" />
      <span class="truncate">{{ modelValue }}</span>
    </slot>
  </EditablePreview>
</template>
