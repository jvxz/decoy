<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

import type { Icon } from '#components'

const props = defineProps<{ class?: HTMLAttributes['class']; name: string }>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <Icon v-bind="delegated" :class="cn('', props.class)" data-slot="showcase-icon">
    <slot />
  </Icon>
</template>
