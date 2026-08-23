<script lang="ts" setup>
import type { Component } from 'vue'

import { DialogAvatar, DialogCodeViewer, DialogDeleteMessage, DialogInvite, DialogLeave } from '#components'

const { dialogKey, open, state } = useGlobalDialog()

const dialogs: Record<GlobalDialog, Component> = {
  avatar: DialogAvatar,
  codeViewer: DialogCodeViewer,
  deleteMessage: DialogDeleteMessage,
  invite: DialogInvite,
  leave: DialogLeave,
}
</script>

<template>
  <component
    :is="dialogs[state.name]"
    v-if="state"
    :key="`${state.name}-${dialogKey}`"
    v-model:open="open"
    v-bind="state"
  />

  <DialogUia />
</template>
