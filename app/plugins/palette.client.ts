export default defineNuxtPlugin({
  dependsOn: ['settings'],
  parallel: true,
  setup: () => {
    const settings = useSettings()
    const colorMode = useColorMode()

    watchImmediate(
      () => settings.value.appearance.palette,
      c => (colorMode.preference = c),
    )
  },
})
