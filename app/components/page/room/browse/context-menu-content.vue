<script lang="ts" setup>
const { payload } = useContextMenuRegion('browseRoom')
const { client } = useMatrixClient()
const { copy } = useClipboard()

const handleCopy = async () => {
  const matrixTo = await getMatrixToUrl(client.value, 'roomId', payload.value!.room.room_id)
  await copy(matrixTo)
}
</script>

<template>
  <UContextMenuRegionContent name="browseRoom">
    <UContextMenuItem @select="handleCopy"> Copy URL </UContextMenuItem>
  </UContextMenuRegionContent>
</template>
