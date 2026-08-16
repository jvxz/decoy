<script lang="ts" setup>
import type { DialogRootProps } from 'reka-ui'

import type { GlobalDialogMap } from '~/composables/use-global-dialog'

export type CodeViewerDialogProps = DialogRootProps & GlobalDialogMap['codeViewer']

const props = withDefaults(defineProps<CodeViewerDialogProps>(), { modal: true })

const open = defineModel<boolean>('open')

const delegated = reactiveOmit(props, ['open', 'lang', 'code'])
</script>

<template>
  <UDialogRoot v-bind="delegated" v-model:open="open">
    <UDialogContent class="p-0 border-0 gap-0 w-full sm:max-h-75%! sm:max-w-52vw!">
      <!-- <UDialogHeader>
        <UDialogTitle> {{ label }} </UDialogTitle>
        <VisuallyHidden>
          <UDialogDescription> {{ label }}'s avatar </UDialogDescription>
        </VisuallyHidden>
      </UDialogHeader> -->

      <UCodeblock
        :header="true"
        :dialog="false"
        :padding="4"
        :input="props.code"
        :lang="props.lang"
        :ui="{
          copyButton: '-top-1 -right-1',
        }"
      >
        <template #header-buttons>
          <DialogClose as-child>
            <UButton variant="ghost" size="icon-xs">
              <Icon name="tabler:x" />
            </UButton>
          </DialogClose>
        </template>
      </UCodeblock>

      <!-- <UDialogFooter>
        <UDialogAnnotation v-if="isError" class="text-danger"> Failed to load avatar </UDialogAnnotation>
        <div class="grow" />
        <UButton :disabled="isError" @click="saveAvatarImage"> Save avatar </UButton>
      </UDialogFooter> -->
    </UDialogContent>
  </UDialogRoot>
</template>
