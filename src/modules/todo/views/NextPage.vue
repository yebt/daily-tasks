<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTodoStore } from '../store/todo.store'
import { TodoService } from '../services/todo.service'
import { TodoCategory, TodoStatus } from '../domain/todo.entity'
import { useConfirmModal } from '@/shared/design-system/composables/useConfirmModal'
import ConfirmModal from '@/shared/design-system/components/ConfirmModal.vue'
import TodoListItem from '../components/TodoListItem.vue'

const todoStore = useTodoStore()
const confirmModal = useConfirmModal()

const selectedIds = ref<Set<string>>(new Set())
const isTransferring = ref(false)
const isDeleting = ref(false)

const nextTodos = computed(() => {
  return [...todoStore.nextTodos].sort((a, b) => b.createdAt - a.createdAt)
})

const selectAll = computed({
  get: () => selectedIds.value.size === nextTodos.value.length && nextTodos.value.length > 0,
  set: (value) => {
    if (value) {
      selectedIds.value = new Set(nextTodos.value.map((t) => t.id!))
    } else {
      selectedIds.value.clear()
    }
  },
})

const toggleTodoSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

const handleUpdateStatus = async (id: string, newStatus: string) => {
  await TodoService.updateTodo(id, { status: newStatus as TodoStatus })
}

const handleDeleteTodo = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Delete task',
    message: 'Are you sure you want to delete this task?',
    confirmText: 'Delete',
    isDangerous: true,
  })

  if (confirmed) {
    try {
      await TodoService.deleteTodo(id)
    } catch (e) {
      console.error('Error deleting todo:', e)
    }
  }
}

const handleTransferSelected = async (category: TodoCategory) => {
  if (selectedIds.value.size === 0) return

  const confirmed = await confirmModal.confirm({
    title: 'Transfer tasks',
    message: `Transfer ${selectedIds.value.size} task(s) to ${category}?`,
    confirmText: 'Transfer',
  })

  if (confirmed) {
    isTransferring.value = true
    try {
      await TodoService.transferTodosBatch(Array.from(selectedIds.value), category)
      selectedIds.value.clear()
    } catch (e) {
      console.error('Error transferring todos:', e)
    } finally {
      isTransferring.value = false
    }
  }
}

const handleDeleteSelected = async () => {
  if (selectedIds.value.size === 0) return

  const confirmed = await confirmModal.confirm({
    title: 'Delete tasks',
    message: `Delete ${selectedIds.value.size} task(s)?`,
    confirmText: 'Delete',
    isDangerous: true,
  })

  if (confirmed) {
    isDeleting.value = true
    try {
      await TodoService.deleteTodosBatch(Array.from(selectedIds.value))
      selectedIds.value.clear()
    } catch (e) {
      console.error('Error deleting todos:', e)
    } finally {
      isDeleting.value = false
    }
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 md:p-10">
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :is-dangerous="confirmModal.isDangerous"
      @confirm="confirmModal.handleConfirm()"
      @cancel="confirmModal.handleCancel()"
    />

    <header class="mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Next</h1>
      <p class="text-sm text-gray-500 mt-2">{{ nextTodos.length }} task(s)</p>
    </header>

    <div v-if="nextTodos.length > 0" class="space-y-4">
      <div
        v-if="selectedIds.size > 0"
        class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg sticky top-0 z-10"
      >
        <input
          v-model="selectAll"
          type="checkbox"
          class="w-4 h-4 rounded cursor-pointer accent-blue-500"
        />
        <span class="text-sm font-medium text-gray-700">{{ selectedIds.size }} selected</span>

        <div class="flex-1" />

        <button
          @click="handleTransferSelected(TodoCategory.Today)"
          :disabled="isTransferring"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
        >
          <em class="i-lucide-arrow-right w-4 h-4" />
          Move to Today
        </button>

        <button
          @click="handleTransferSelected(TodoCategory.SomeDay)"
          :disabled="isTransferring"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
        >
          <em class="i-lucide-arrow-right w-4 h-4" />
          Move to Someday
        </button>

        <button
          @click="handleDeleteSelected"
          :disabled="isDeleting"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          <em class="i-lucide-trash-2 w-4 h-4" />
          Delete
        </button>
      </div>

      <div class="space-y-2">
        <TransitionGroup name="list">
          <TodoListItem
            v-for="todo in nextTodos"
            :key="todo.id"
            :todo="todo"
            :selected="selectedIds.has(todo.id!)"
            @toggle:select="toggleTodoSelect(todo.id!)"
            @update:status="(status) => handleUpdateStatus(todo.id!, status)"
            @delete="handleDeleteTodo(todo.id!)"
          />
        </TransitionGroup>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <em class="i-lucide-inbox w-12 h-12 mx-auto text-gray-300 mb-4 block" />
      <p class="text-gray-500">No tasks yet. Create one to get started!</p>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
