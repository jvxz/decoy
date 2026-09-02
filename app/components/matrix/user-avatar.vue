<script lang="ts" setup>
import type { MatrixAvatarProps } from './avatar.vue'

export interface UserAvatarProps extends Omit<MatrixAvatarProps, 'alt' | 'src'> {
  user: MaybeUserOrId | undefined | null
}

const props = defineProps<UserAvatarProps>()
const profile = useUserProfile(() => props.user ?? undefined)

const alt = computed(() =>
  profile.value?.displayname ? profile.value.displayname : props.user ? resolveUserId(props.user) : 'User',
)

const delegated = reactiveOmit(props, 'user')
</script>

<template>
  <MatrixAvatar v-bind="delegated" :alt :src="profile?.avatar_url" data-slot="user-avatar" />
</template>
