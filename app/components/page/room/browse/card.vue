<script lang="ts" setup>
import type { HierarchyRoom } from 'matrix-js-sdk'
import type { PrimitiveProps } from 'reka-ui'

const props = defineProps<
  PrimitiveProps & {
    room: HierarchyRoom
    suggested?: boolean
  }
>()

const manualAvatarSrc = useResolveAvatarUrl(() => props.room.avatar_url)
</script>

<template>
  <URoomShowcaseCardRoot always-show-avatar :as :as-child :room="room.room_id" :manual-avatar-src>
    <URoomShowcaseCardContent>
      <URoomShowcaseCardHeader class="shrink">
        <URoomShowcaseCardTitle class="flex gap-2 max-h-1em items-center">
          <p class="text-sm font-medium truncate">
            {{ room.name ?? room.room_id }}
          </p>

          <UBadge v-if="suggested" size="sm"> Suggested </UBadge>
        </URoomShowcaseCardTitle>

        <URoomShowcaseCardDescription class="text-xs text-muted-foreground">
          <span class="text-muted-foreground shrink-0"> {{ room.num_joined_members }} members </span>

          <template v-if="room.topic">
            <UInlineSeparator />
            <span>
              {{ room.topic }}
            </span>
          </template>
        </URoomShowcaseCardDescription>
      </URoomShowcaseCardHeader>
    </URoomShowcaseCardContent>
  </URoomShowcaseCardRoot>
</template>
