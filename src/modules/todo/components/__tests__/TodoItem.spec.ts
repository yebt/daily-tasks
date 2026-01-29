import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoItem from '../TodoItem.vue'
import { TodoStatus, TodoCategory } from '../../domain/todo.entity'
import type { Todo } from '../../domain/todo.entity'

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test task',
    status: TodoStatus.Waiting,
    category: TodoCategory.Today,
    userId: 'user123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  it('renders task text', () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    expect(wrapper.text()).toContain('Test task')
  })

  it('displays completed styling when status is COMPLETED', () => {
    const completedTodo = { ...mockTodo, status: TodoStatus.Completed }

    const wrapper = mount(TodoItem, {
      props: {
        todo: completedTodo,
      },
    })

    const textDiv = wrapper.find('div[class*="flex-1"]')
    expect(textDiv.classes()).toContain('text-emerald-700/70')
    expect(textDiv.classes()).toContain('line-through')
  })

  it('emits update:status event when status button menu changes', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    // Find the status button (first button)
    const buttons = wrapper.findAll('button')
    const statusButton = buttons[0]
    if (statusButton) {
      await statusButton.trigger('click')

      // Find and click on a different status option (second status button in menu)
      const allButtons = wrapper.findAll('button')
      if (allButtons[1]) {
        await allButtons[1].trigger('click')
      }
    }

    expect(wrapper.emitted('update:status')).toBeTruthy()
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const deleteButton = wrapper.find('button[title="Delete task"]')
    await deleteButton.trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('renders correct icon based on status', () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const icon = wrapper.find('em')
    expect(icon.classes()).toContain('i-lucide:circle-dashed') // Waiting status icon
  })

  it('applies emerald background when todo is completed', () => {
    const completedTodo = { ...mockTodo, status: TodoStatus.Completed }

    const wrapper = mount(TodoItem, {
      props: {
        todo: completedTodo,
      },
    })

    const container = wrapper.find('div')
    expect(container.classes()).toContain('bg-emerald-50/30')
  })

  it('displays all status options in status menu', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const buttons = wrapper.findAll('button')
    const statusButton = buttons[0]
    if (statusButton) {
      await statusButton.trigger('click')

      const allButtons = wrapper.findAll('button')
      // Status menu should have multiple buttons (all the status options)
      expect(allButtons.length).toBeGreaterThan(1)
    }
  })

  it('enters edit mode on double click and emits update:text on save', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const textDiv = wrapper.find('div[class*="flex-1"]')
    await textDiv.trigger('dblclick')

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Updated task')
    await input.trigger('blur')

    expect(wrapper.emitted('update:text')).toBeTruthy()
    expect(wrapper.emitted('update:text')?.[0]).toEqual(['Updated task'])
  })

  it('does not emit update:text if text is unchanged', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const textDiv = wrapper.find('div[class*="flex-1"]')
    await textDiv.trigger('dblclick')

    const input = wrapper.find('input[type="text"]')
    await input.trigger('blur')

    expect(wrapper.emitted('update:text')).toBeFalsy()
  })

  it('emits update:category when category is changed', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const transferButton = wrapper.find('button[title="Transfer to category"]')
    await transferButton.trigger('click')

    const categoryButton = wrapper
      .findAll('div button')
      .find((btn) => btn.text().includes('Next') || btn.text().includes('Someday'))
    if (categoryButton) {
      await categoryButton.trigger('click')
    }

    expect(wrapper.emitted('update:category')).toBeTruthy()
  })
})
