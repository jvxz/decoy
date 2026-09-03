<script lang="ts" setup>
import type { MatrixRoomAvatarProps } from '~/components/matrix/room-avatar.vue'

const props = withDefaults(defineProps<MatrixRoomAvatarProps & { class?: string }>(), { square: true })

const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <MatrixRoomAvatar v-bind="delegated" :class="cn('rounded shrink-0 size-10', props.class)" />
</template>
