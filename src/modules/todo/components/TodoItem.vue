<script setup lang="ts">
import { getTodoStatusIcon, TodoStatus, TodoStatuses, type Todo } from '../domain/todo.entity'
import {  motion } from 'motion-v'

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

const classesTodoStatusIcon: Record<TodoStatus, string> = {
  [TodoStatus.Inprogress]: 'text-blue-500',
  [TodoStatus.Waiting]: 'text-gray-400/50',
  [TodoStatus.Appointment]: 'text-gray-400',
  [TodoStatus.Delegated]: 'text-gray-400',
  [TodoStatus.Completed]: 'text-emerald-500',
  [TodoStatus.Cancel]: 'text-gray-400',
}

const classesTodoStatus: Record<TodoStatus, string> = {
  [TodoStatus.Inprogress]: '',
  [TodoStatus.Waiting]: '',
  [TodoStatus.Appointment]: '',
  [TodoStatus.Delegated]: '',
  [TodoStatus.Completed]: 'bg-emerald-50/30 hover:bg-emerald-50/70',
  [TodoStatus.Cancel]: 'bg-stone-50/30 opacity-60 italic',
}
</script>

<template>
  <motion.div
    drag
    dragDirectionLock
    :dragConstraints="{ top: 0, bottom: 0, left: 0, right: 0 }"
    :dragTransition="{ bounceStiffness: 300, bounceDamping: 20 }"
    :dragElastic="0.1"
    :whileDrag="{ cursor: 'grabbing', scale: 1.03 }"
    class="relative"
  >

  <div
    class="flex items-center gap-3 p-2 rounded-md group transition-all hover:( outline-gray-900/20 ) outline-1 -outline-offset-1- outline-dashed outline-transparent"
    :class="[classesTodoStatus[todo.status]]"
  >
    <div class="relative w-5 h-5 flex items-center justify-center">
      <em
        :class="[getStatusIcon(todo.status), classesTodoStatusIcon[todo.status]]"
        class="w-4 h-4 group-hover:text-blue-500 drop-shadow transition"
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
      class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all flex"
      title="Delete task"
    >
      <em class="i-lucide-trash-2 w-4 h-4" />
    </button>
  </div>

  </motion.div>
</template>
