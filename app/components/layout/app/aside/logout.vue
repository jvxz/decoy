<script lang="ts" setup>
const confirm = ref(false)
const open = ref(false)

const { logout } = useAuth()
</script>

<template>
  <UAlertDialogRoot :open="open || confirm" @update:open="open = $event">
    <UAlertDialogTrigger as-child>
      <UButton
        variant="soft"
        class="rounded-xl flex size-12 items-center justify-center"
      >
        <Icon name="mingcute:arrow-to-left-line" class="text-foreground size-6" />
      </UButton>
    </UAlertDialogTrigger>
    <UAlertDialogContent>
      <UAlertDialogHeader>
        <UAlertDialogTitle>
          Log Out
        </UAlertDialogTitle>
        <UAlertDialogDescription>
          Are you sure you want to logout?
        </UAlertDialogDescription>
      </UAlertDialogHeader>
      <UAlertDialogFooter class="all:flex-1">
        <UAlertDialogCancel
          size="lg"
          variant="soft"
        >
          Cancel
        </UAlertDialogCancel>
        <UButton
          :is-loading="confirm"
          size="lg"
          variant="danger"
          @click="confirm = true; logout()"
        >
          Log Out
        </UButton>
      </UAlertDialogFooter>
    </UAlertDialogContent>
  </UAlertDialogRoot>
</template>
