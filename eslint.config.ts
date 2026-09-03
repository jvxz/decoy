import { antfu } from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

import { withNuxt } from './.nuxt/eslint.config.mjs'
import { oxlintJsPluginRules, oxlintVueFallbackRules } from './oxlint.config.ts'

const disableRules = (rules: readonly string[]) => Object.fromEntries(rules.map(rule => [rule, 'off'] as const))
const jsPluginRuleNames = Object.keys(oxlintJsPluginRules)
const vueFallbackRules = new Set<string>(oxlintVueFallbackRules)

const eslintConfig = antfu({
  formatters: false,
  ignores: ['.pnpm-store/', '*.md', 'oxlint.config.ts', 'oxfmt.config.ts'],
  imports: false,
  rules: {
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-objects': 'warn',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-self-closing': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/sort-keys': 'warn',
  },
  stylistic: false,
  typescript: true,
  unocss: true,
  vue: true,
}).renamePlugins({
  node: 'n',
  test: 'vitest',
  ts: '@typescript-eslint',
})

export default withNuxt(await eslintConfig).append(
  // oxfmt owns package.json key ordering (conventional npm order)
  { files: ['package.json'], rules: { 'jsonc/sort-keys': 'off' } },
  {
    rules: disableRules([
      'perfectionist/sort-named-imports',
      'perfectionist/sort-objects',
      'no-unreachable-loop',
      'vitest/no-only-tests',
      'vue/first-attribute-linebreak',
      'vue/html-closing-bracket-spacing',
      'vue/html-quotes',
      'vue/mustache-interpolation-spacing',
      'vue/no-multi-spaces',
      'vue/no-spaces-around-equal-signs-in-attribute',
      'vue/space-infix-ops',
      'vue/space-unary-ops',
    ]),
  },
  { ignores: ['**/*.vue'], rules: { 'vue/sort-keys': 'off' } },
  { ignores: ['**/*.vue'], rules: disableRules(jsPluginRuleNames) },
  {
    files: ['**/*.vue'],
    rules: disableRules(jsPluginRuleNames.filter(rule => !vueFallbackRules.has(rule))),
  },
  ...oxlint.configs['flat/correctness'],
  ...oxlint.configs['flat/suspicious'],
  ...oxlint.configs['flat/typescript'],
  ...oxlint.configs['flat/unicorn'],
  ...oxlint.configs['flat/import'],
  ...oxlint.configs['flat/eslint'],
  ...oxlint.configs['flat/jsdoc'],
  ...oxlint.configs['flat/node'],
  ...oxlint.configs['flat/style'],
  ...oxlint.configs['flat/vitest'],
  ...oxlint.configs['flat/vue'],
)
