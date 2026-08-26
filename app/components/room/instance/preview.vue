<script lang="ts" setup>
import { JoinRule } from 'matrix-js-sdk'

const props = defineProps<{ roomId: string }>()

const params = useKnownSearchParams()
const via = computed(() => toArray(params.value.via ?? []))
const { data: summary, isLoading: isSummaryLoading } = useRoomSummary(() => props.roomId, via)

const name = computed(() => summary.value?.name ?? props.roomId)
const avatarSrc = useResolveAvatarUrl(() => summary.value?.avatar_url)

const { inviteIds } = useInvites()
const isInvited = computed(() => inviteIds.value.has(props.roomId))
const canAttemptJoin = computed(
  () => isInvited.value || (summary.value ? summary.value?.join_rule === JoinRule.Public : true),
)

const { join } = useRoomActions(() => props.roomId)
</script>

<template>
  <div class="flex size-full items-center justify-center">
    <div class="flex flex-col gap-4 max-w-md w-full">
      <!-- avatar -->
      <USkeleton v-if="isSummaryLoading" class="rounded size-16" />
      <MatrixAvatar v-else :src="avatarSrc" :alt="name" square class="rounded size-16" :placeholder-key="roomId" />

      <div class="flex flex-col gap-1">
        <div class="flex gap-2 items-center">
          <!-- title -->
          <h1 v-if="!isSummaryLoading" class="text-xl font-semibold">
            {{ name }}
          </h1>
          <USkeleton v-else class="text-xl h-1lh w-3/4" />

          <!-- join rule icon -->
          <UTooltipRoot v-if="summary?.join_rule">
            <UTooltipTrigger as-child>
              <Icon :name="summary.join_rule === JoinRule.Public ? 'tabler:world' : 'tabler:lock'" />
            </UTooltipTrigger>

            <UTooltipContent> This room is {{ resolveJoinRuleLabel(summary.join_rule) }} </UTooltipContent>
          </UTooltipRoot>
        </div>

        <!-- room id -->
        <p v-if="summary" class="text-sm text-muted-foreground">{{ roomId }}</p>
      </div>

      <!-- description -->
      <p v-if="summary?.topic" class="text-sm text-muted-foreground">
        {{ summary.topic }}
      </p>

      <!-- details -->
      <div v-if="summary" class="flex flex-col gap-1">
        <p class="text-sm flex gap-1 items-center">
          <Icon name="tabler:users" />
          <span class="tabular-nums">
            {{ $n(summary.num_joined_members) }}
            {{ handlePlural(summary.num_joined_members, 'members', 'member') }}
          </span>
        </p>
      </div>

      <!-- actions -->
      <div class="flex gap-1">
        <!-- <UTooltipRoot :disabled="!!summary && summary?.join_rule !== JoinRule.Public && !isSummaryLoading"> -->
        <UTooltipRoot :disabled="canAttemptJoin || isSummaryLoading">
          <UTooltipTrigger as-child>
            <UButton
              variant="default"
              :is-loading="join.isPending.value"
              :disabled="isSummaryLoading || !canAttemptJoin"
              @click="join.mutate({ via })"
            >
              <span v-if="isInvited">Accept invite</span>
              <span v-else>Join room</span>
            </UButton>
          </UTooltipTrigger>

          <UTooltipContent> This room is not public </UTooltipContent>
        </UTooltipRoot>

        <UButton v-if="summary" :disabled="!summary.world_readable" variant="outline"> Peek in room </UButton>
      </div>
    </div>
  </div>
</template>
