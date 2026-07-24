<script lang="ts" setup>
definePageMeta({
  layout: 'app',
  middleware: (to, from) => {
    const KEY = 'lastRoute'
    const lastRoute = localStorage.getItem(KEY)

    if (lastRoute === '/app/me') {
      localStorage.setItem(KEY, '/app/me/home')
      return navigateTo('/app/me/home')
    }

    if (lastRoute && !from.path.startsWith('/app/me') && to.path !== lastRoute) {
      return navigateTo(lastRoute)
    }

    localStorage.setItem(KEY, to.path)
  },
  name: 'me',
})
</script>

<template>
  <LayoutAppSlot name="aside-header">
    <LayoutAppAsideHeaderTitle class="px-2">
      <UButton variant="soft" class="w-full">
        <p class="text-xs">Find or start a conversation</p>
      </UButton>
    </LayoutAppAsideHeaderTitle>
  </LayoutAppSlot>

  <LayoutAppSlot name="aside">
    <PageMeAsideButtons />
  </LayoutAppSlot>

  <NuxtPage />
</template>
