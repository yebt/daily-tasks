import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  it('renders properly', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: '<div />' }, // Mock RouterView
        },
      },
    })
    // No specific text assertion needed as App.vue only contains RouterView
    expect(wrapper.exists()).toBe(true)
  })
})
