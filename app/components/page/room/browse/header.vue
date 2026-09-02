<script lang="ts" setup>
import type { Room } from 'matrix-js-sdk'

const props = defineProps<{
  space: Room | undefined
  isLoading: boolean
  description?: string
}>()

const topic = useRoomTopic(() => props.space)
const joinedMemberCount = useRoomMemberCount(() => props.space)
const creationTs = useRoomCreationTs(() => props.space)
const founder = useRoomFounder(() => props.space)
</script>

<template>
  <UShowcaseHeader>
    <UShowcaseTitle>
      <UShowcaseAvatar v-if="space" :room="space" />
      <USkeleton v-else class="rounded shrink-0 size-10" />

      <h1 v-if="space">
        {{ space?.name }}
      </h1>
      <USkeleton v-else class="text-3xl h-1em w-48" />

      <UShowcaseSpinner v-if="isLoading" />
    </UShowcaseTitle>

    <UShowcaseDescription v-if="topic">
      {{ topic }}
    </UShowcaseDescription>

    <UShowcaseDetails>
      <div>
        <Icon name="tabler:users" />

        <span v-if="isDefined(joinedMemberCount)">{{ joinedMemberCount }}</span>
        <USkeleton v-else class="h-1em w-4" />

        <span>members</span>
      </div>

      <UInlineSeparator />

      <UTooltipRoot :disabled="isNil(creationTs)">
        <UTooltipTrigger as-child>
          <span>
            <Icon name="tabler:calendar" />
            <span>Founded</span>

            <NuxtTime v-if="isDefined(creationTs)" :datetime="creationTs" />
            <USkeleton v-else class="h-1em w-16" />
          </span>
        </UTooltipTrigger>

        <UTooltipContent v-if="isDefined(creationTs)">
          <NuxtTime :datetime="creationTs" v-bind="PROPS__NUXT_TIME_FULL" />
        </UTooltipContent>
      </UTooltipRoot>

      <UInlineSeparator />

      <UProfilePopoverTrigger
        v-if="founder"
        as-child
        :manual-room="space"
        :user="founder.userId"
        :content-props="{
          side: 'bottom',
          sideOffset: 12,
        }"
      >
        <UButton
          variant="link"
          class="font-normal no-underline flex gap-2 items-center data-[state=open]:underline hover:underline h-1em!"
        >
          <MatrixRoomMemberAvatar :room="space" :member="founder.userId" class="size-4" />
          <span>{{ resolveUserName(founder) }}</span>
        </UButton>
      </UProfilePopoverTrigger>

      <div v-else class="flex gap-2 items-center">
        <USkeleton class="size-4" />
        <USkeleton class="h-1em w-16" />
      </div>
    </UShowcaseDetails>
  </UShowcaseHeader>
</template>
