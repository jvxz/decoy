<script lang="ts">
export const SORT_SELECT_OPTIONS = ['name', 'date-modified', 'date-created'] as const
export const SORT_SELECT_DIRS = ['asc', 'desc'] as const
export type SortSelectOption = (typeof SORT_SELECT_OPTIONS)[number]
export type SortSelectDir = (typeof SORT_SELECT_DIRS)[number]

export interface SortSelectModelValue {
  option: SortSelectOption
  dir: SortSelectDir
}

export interface SortSelectRootProps {
  class?: string
  options?: SortSelectOption[]
  modelValue?: SortSelectModelValue
  defaultValue?: SortSelectModelValue
  disabled?: boolean
}

export interface SortSelectContext {
  options: Ref<SortSelectOption[]>
  modelValue: Ref<SortSelectModelValue>
}

export const [injectSortSelectContext, provideSortSelectContext] = createContext<SortSelectContext>('USortSelectRoot')
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<SortSelectRootProps>(), {
  defaultValue: () => ({ dir: 'asc', option: 'name' }),
  options: () => ['name', 'date-created'],
})
const emits = defineEmits<{
  'update:modelValue': [value: SortSelectModelValue]
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
}) as Ref<SortSelectModelValue>

const options = toRef(props, 'options')

provideSortSelectContext({ modelValue, options })

function setOption(value: unknown) {
  modelValue.value = { ...modelValue.value, option: value as SortSelectOption }
}
</script>

<template>
  <div data-slot="sort-select-root" :class="cn('flex items-center', props.class)">
    <USelectRoot :model-value="modelValue.option" :disabled="disabled" @update:model-value="setOption">
      <slot />
    </USelectRoot>
  </div>
</template>
