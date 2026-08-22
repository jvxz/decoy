<script lang="ts" setup>
const { open, state } = useGlobalDialog()
</script>

<template>
  <DialogLeave v-if="state?.name === 'leave'" v-model:open="open" :room="state.room" />
  <DialogInvite v-else-if="state?.name === 'invite'" v-model:open="open" :room="state.roomId" />
  <DialogAvatar v-else-if="state?.name === 'avatar'" v-model:open="open" v-bind="state" />
  <DialogCodeViewer v-else-if="state?.name === 'codeViewer'" v-model:open="open" v-bind="state" />
  <DialogDeleteMessage v-else-if="state?.name === 'deleteMessage'" v-model:open="open" v-bind="state" />

  <DialogUia />
</template>
