<script setup lang="ts">
import { getTodoStatusIcon, TodoStatus, TodoStatuses, type Todo } from '../domain/todo.entity'

interface Props {
  todo: Todo
}

defineProps<Props>()

const emit = defineEmits<{
  'update:status': [status: string]
  delete: []
}>()

const getStatusIcon = (statusValue: TodoStatus): string => {
  return getTodoStatusIcon(statusValue)
}

const handleStatusChange = (newStatus: string) => {
  emit('update:status', newStatus)
}

const handleDelete = () => {
  emit('delete')
}

const statuses = TodoStatuses
</script>

<template>
  <div
    class="flex items-center gap-3 p-2 rounded-md hover:bg-white group transition-colors"
    :class="{ 'bg-emerald-50/30': todo.status === TodoStatus.Completed }"
  >
    <div class="relative w-5 h-5 flex items-center justify-center">
      <em
        :class="[
          getStatusIcon(todo.status),
          todo.status === TodoStatus.Completed ? 'text-emerald-500' : 'text-gray-400',
        ]"
        class="w-4 h-4 group-hover:text-blue-500"
      />
      <select
        :value="todo.status"
        @change="(e) => handleStatusChange((e.target as HTMLSelectElement).value)"
        class="absolute inset-0 opacity-0 cursor-pointer"
      >
        <option v-for="s in statuses" :key="s.value" :value="s.value">
          {{ s.label }}
        </option>
      </select>
    </div>

    <span
      class="text-sm flex-1 select-none"
      :class="{
        'line-through text-slate-400 font-normal':
          todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
        'text-emerald-700/70': todo.status === TodoStatus.Completed,
      }"
    >
      {{ todo.text }}
    </span>
    <button
      @click="handleDelete"
      class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50
      rounded transition-all flex"
      title="Delete task"
    >
      <em class="i-lucide-trash-2 w-4 h-4" />
    </button>
  </div>
</template>
