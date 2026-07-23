<script lang="ts" setup>
import type { PrimitiveProps } from 'reka-ui'

defineProps<PrimitiveProps>()
</script>

<template>
  <Primitive v-bind="$props" :class="cn('mt-12 flex gap-3.5 flex-col p-3.5 mx-auto max-w-screen-md', $attrs.class)">
    <slot />
  </Primitive>
</template>
