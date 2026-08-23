<script lang="ts" setup>
import type { UCodeblockRootProps } from './u/codeblock.vue'

const props = defineProps<{
  content: string | undefined
  inline?: boolean
  codeblockUi?: UCodeblockRootProps['ui']
}>()

const segments = useMarked(() => props.content)
</script>

<template>
  <template v-for="(s, i) in segments" :key="i">
    <UCodeblock
      v-if="s.type === 'code'"
      :ui="codeblockUi"
      :input="s.code"
      :lang="s.lang"
      :numbers="false"
      :header="true"
    />

    <div v-else-if="s.type === 'html'" v-html="s.html" />
  </template>
</template>

<style>
[data-event] img.twemoji-parse {
  height: 1em;
  width: 1em;
  margin: 0 0.15em 0 0;
  vertical-align: -0.1em;
  display: inline;
}
</style>
