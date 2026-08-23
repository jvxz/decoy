<script lang="ts" setup>
import type { Component } from 'vue'

import { DialogAvatar, DialogCodeViewer, DialogDeleteMessage, DialogInvite, DialogLeave } from '#components'

const { open, state, dialogKey } = useGlobalDialog()

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
    v-if="state"
    :is="dialogs[state.name]"
    :key="`${state.name}-${dialogKey}`"
    v-model:open="open"
    v-bind="state"
  />

  <DialogUia />
</template>
