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

    const span = wrapper.find('span')
    expect(span.classes()).toContain('text-emerald-700/70')
    expect(span.classes()).toContain('line-through')
  })

  it('emits update:status event when status dropdown changes', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const select = wrapper.find('select')
    await select.setValue(TodoStatus.Inprogress)

    expect(wrapper.emitted('update:status')).toBeTruthy()
    expect(wrapper.emitted('update:status')?.[0]).toEqual([TodoStatus.Inprogress])
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const deleteButton = wrapper.find('button')
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
    expect(icon.classes()).toContain('i-lucide-clock') // Waiting status icon
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

  it('displays all status options in dropdown', () => {
    const wrapper = mount(TodoItem, {
      props: {
        todo: mockTodo,
      },
    })

    const options = wrapper.findAll('option')
    expect(options.length).toBeGreaterThan(0)
  })
})
