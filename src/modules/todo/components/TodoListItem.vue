<script setup lang="ts">
import { computed, ref } from 'vue'
import { getTodoStatusIcon, TodoStatus, type Todo } from '../domain/todo.entity'

interface Props {
  todo: Todo
  selected?: boolean
  currentCategory?: 'TODAY' | 'NEXT' | 'SOME DAY'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:status': [status: string]
  delete: []
  'toggle:select': []
  transfer: [category: 'TODAY' | 'NEXT' | 'SOME DAY']
}>()

const isTransferMenuOpen = ref(false)
const transferMenuPositionTop = ref(true)

const getStatusIcon = (statusValue: TodoStatus): string => {
  return getTodoStatusIcon(statusValue)
}

const handleStatusChange = (newStatus: string) => {
  emit('update:status', newStatus)
}

const handleDelete = () => {
  emit('delete')
}

const handleToggleSelect = () => {
  emit('toggle:select')
}

const openTransferMenu = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  const buttonRect = button.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const menuHeight = 130 // Approximate height of transfer menu

  transferMenuPositionTop.value = buttonRect.bottom + menuHeight + 10 < windowHeight
  isTransferMenuOpen.value = true
}

const closeTransferMenu = () => {
  isTransferMenuOpen.value = false
}

const handleTransfer = (category: 'TODAY' | 'NEXT' | 'SOME DAY') => {
  emit('transfer', category)
  closeTransferMenu()
}

const getTransferOptions = (): Array<{
  label: string
  value: 'TODAY' | 'NEXT' | 'SOME DAY'
  icon: string
}> => {
  const allOptions = [
    { label: 'Today', value: 'TODAY' as const, icon: 'i-lucide:target' },
    { label: 'Next', value: 'NEXT' as const, icon: 'i-lucide:clock' },
    { label: 'Someday', value: 'SOME DAY' as const, icon: 'i-lucide:lightbulb' },
  ]
  // Filter out current category
  return allOptions.filter((opt) => opt.value !== props.currentCategory)
}

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

const formattedDate = computed(() => {
  return new Date(props.todo.createdAt.toDate()).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>

<template>
  <div
    :class="[classesTodoStatus[todo.status], selected ? 'ring-2 ring-blue-500 bg-blue-50/30' : '']"
    class="flex items-center gap-3 p-3 rounded-md group transition-all hover:( outline-gray-900/20 ) outline-1 outline-dashed outline-transparent"
  >
    <input
      type="checkbox"
      :checked="selected"
      @change="handleToggleSelect"
      class="w-4 h-4 rounded cursor-pointer accent-blue-500"
    />

    <div class="relative w-5 h-5 flex items-center justify-center">
      <em
        :class="[getStatusIcon(todo.status), classesTodoStatusIcon[todo.status]]"
        class="w-4 h-4 drop-shadow transition"
      />
      <select
        :value="todo.status"
        @change="(e) => handleStatusChange((e.target as HTMLSelectElement).value)"
        class="absolute inset-0 opacity-0 cursor-pointer"
      >
        <option v-for="status in Object.values(TodoStatus)" :key="status" :value="status">
          {{ status }}
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

    <span class="text-xs text-gray-400 whitespace-nowrap">{{ formattedDate }}</span>

    <!-- Transfer Menu Button -->
    <div class="relative">
      <button
        v-if="getTransferOptions().length > 0"
        @click="openTransferMenu"
        class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-all flex"
        title="Move to another category"
      >
        <em class="i-lucide-arrow-right w-4 h-4" />
      </button>

      <!-- Transfer Menu Dropdown -->
      <div
        v-if="isTransferMenuOpen"
        @mouseleave="closeTransferMenu"
        :class="[
          transferMenuPositionTop ? 'top-full mt-1' : 'bottom-full mb-1',
          'absolute right-0 min-w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50',
        ]"
      >
        <button
          v-for="option in getTransferOptions()"
          :key="option.value"
          @click="() => handleTransfer(option.value)"
          class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-md last:rounded-b-md transition-colors"
        >
          <em :class="option.icon" class="w-4 h-4 text-gray-500" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>

    <button
      @click="handleDelete"
      class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all flex"
      title="Delete task"
    >
      <em class="i-lucide-trash-2 w-4 h-4" />
    </button>
  </div>
</template>
