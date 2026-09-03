<script lang="ts" setup>
definePageMeta({
  name: 'invites',
})

defineAppLabel({ label: 'Invites' })

const { invites } = useInvites()

const contextMenuOpen = ref(false)
watch(
  () => invites.value.size,
  () => (contextMenuOpen.value = false),
)
</script>

<template>
  <LayoutAppSlot name="page-header">
    <LayoutAppPageHeader icon="tabler:inbox"> Invites </LayoutAppPageHeader>
  </LayoutAppSlot>

  <LayoutAppGenericPage class="pb-page-y-padding size-full">
    <UShowcaseRoot>
      <UShowcaseHeader>
        <UShowcaseTitle> Invites </UShowcaseTitle>
      </UShowcaseHeader>
    </UShowcaseRoot>

    <UShowcaseSeparator />

    <UShowcaseContent class="size-full">
      <UContextMenuRegionRoot v-model:open="contextMenuOpen" name="invite">
        <template v-if="invites.size">
          <PageMeInvitesCard v-for="inviteRoom in invites" :key="inviteRoom.roomId" :invite-room />
        </template>

        <UEmptyRoot v-else class="size-full items-center justify-center">
          <UEmptyIcon variant="naked" name="tabler:inbox" />
          <UEmptyDescription> No pending invites </UEmptyDescription>
        </UEmptyRoot>

        <UContextMenuRegionContent v-slot="{ payload }" name="invite">
          <PageMeInvitesCardContextMenu :payload />
        </UContextMenuRegionContent>
      </UContextMenuRegionRoot>
    </UShowcaseContent>
  </LayoutAppGenericPage>
</template>
