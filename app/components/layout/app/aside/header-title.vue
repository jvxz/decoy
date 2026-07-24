<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <h2 v-bind="delegated" :class="cn('font-medium p-2.5 px-4 flex size-full items-center', props.class)">
    <slot>
      {{ upperFirst($route.name) }}
    </slot>
  </h2>
</template>
