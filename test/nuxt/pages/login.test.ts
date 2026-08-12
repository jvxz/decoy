import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import AuthLayout from '~/layouts/auth.vue'
import LoginPage from '~/pages/login/index.vue'

// the login page injects the auth layout context, so it must be mounted inside the layout
const mountPage = async () => mountSuspended(AuthLayout, { slots: { default: () => h(LoginPage) } })

const { getLoginFlows } = vi.hoisted(() => ({
  getLoginFlows: vi.fn().mockResolvedValue({ flows: [{ type: 'm.login.password' }] }),
}))
mockNuxtImport('getLoginFlows', () => getLoginFlows)

describe('login page', () => {
  it('allows default homeserver', async () => {
    const component = await mountPage()
    await vi.waitFor(() => expect(component.text()).not.toContain('Invalid homeserver'))
  })

  it('denies invalid homeserver', async () => {
    window.history.pushState({}, '', '/?homeserver=invalid.example.org')

    const component = await mountPage()

    await vi.waitFor(() => expect(component.text()).toContain('Invalid homeserver'))
  })
})
