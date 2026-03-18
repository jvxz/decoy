<script lang="ts" setup>
import { SplitterGroup, SplitterPanel } from 'reka-ui'

const layout = useCookie<number[]>('splitter:asideExtraLayout', {
  default: () => [300, 240],
})

const slots = useSlots()
const hasAside = computed(() => !!slots.aside)

const [DefineHeader, Header] = createReusableTemplate()
</script>

<template>
  <DefineHeader v-slot="{ $slots }">
    <div class="h-header-height border-b bg-card shrink-0 w-full top-0 sticky z-20">
      <component :is="$slots.default" />
    </div>
  </DefineHeader>

  <div class="flex h-screen relative *:shrink-0">
    <LayoutAppAside />
    <main class="bg-card flex-1 shrink h-full">
      <SplitterGroup
        v-if="hasAside"
        id="aside-extra-splitter-group"
        direction="horizontal"
        class="h-full"
        @layout="layout = $event"
      >
        <SplitterPanel
          id="aside-extra-splitter-panel-1"
          :default-size="layout[0]"
          :min-size="240"
          :max-size="400"
          class="bg-background shrink-0 min-h-screen top-0 sticky"
          size-unit="px"
        >
          <div class="h-header-height p-4 border-b flex items-center">
            <h2 class="text-lg font-medium">
              {{ upperFirst($route.name) }}
            </h2>
          </div>
          <slot name="aside" />
        </SplitterPanel>
        <SplitterResizeHandle id="aside-extra-splitter-resize-handle" class="group relative">
          <div class="bg-muted-foreground opacity-75 h-full w-1.5 pointer-events-none transition-all duration-75 delay-150 ease-in-out inset-0 absolute z-10 group-data-[state=inactive]:opacity-0 group-data-[state=inactive]:w-0.5 -translate-x-1/2 group-data-[state=inactive]:delay-0" />
        </SplitterResizeHandle>
        <SplitterPanel
          id="aside-extra-splitter-panel-2"
          :default-size="layout[1]"
          size-unit="px"
        >
          <div class="flex flex-col h-full">
            <Header v-if="$slots.header">
              <slot name="header" />
            </Header>

            <slot />
          </div>
        </SplitterPanel>
      </SplitterGroup>

      <div v-else class="flex flex-col h-full">
        <Header v-if="$slots.header">
          <slot name="header" />
        </Header>

        <slot />
      </div>
    </main>
  </div>
</template>
