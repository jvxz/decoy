<script lang="ts" setup>
const props = defineProps<{
  content: string | undefined
  inline?: boolean
}>()

const md = useMarked(() => props.content, { inline: props.inline })
</script>

<template>
  <div v-bind="$attrs" v-html="md" />
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
