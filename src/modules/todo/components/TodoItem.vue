<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import {
  getTodoStatusIcon,
  TodoStatus,
  TodoStatuses,
  TodoCategory,
  type Todo,
} from '../domain/todo.entity'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:status': [status: string]
  'update:text': [text: string]
  'update:category': [category: TodoCategory]
  delete: []
}>()

const isEditing = ref(false)
const editedText = ref(props.todo.text)
const showCategoryMenu = ref(false)
const inputRef = ref<HTMLInputElement>()
const containerRef = ref<HTMLDivElement>()

const getStatusIcon = (statusValue: TodoStatus): string => {
  return getTodoStatusIcon(statusValue)
}

const handleStatusChange = (newStatus: string) => {
  emit('update:status', newStatus)
}

const handleDelete = () => {
  emit('delete')
}

const handleDoubleClick = async () => {
  isEditing.value = true
  editedText.value = props.todo.text
  await nextTick()
  inputRef.value?.focus()
  // inputRef.value?.select()
}

const handleEditSave = () => {
  const trimmedText = editedText.value.trim()
  if (trimmedText && trimmedText !== props.todo.text) {
    emit('update:text', trimmedText)
  }
  isEditing.value = false
  showCategoryMenu.value = false
}

const handleEditCancel = () => {
  isEditing.value = false
  editedText.value = props.todo.text
  showCategoryMenu.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleEditSave()
  } else if (e.key === 'Escape') {
    handleEditCancel()
  }
}

const handleTransferCategory = (newCategory: TodoCategory) => {
  if (newCategory !== props.todo.category) {
    emit('update:category', newCategory)
  }
  showCategoryMenu.value = false
}

const handleContainerMouseLeave = () => {
  showCategoryMenu.value = false
}

const isTransferable = computed(() => {
  return Object.values(TodoCategory).filter((cat) => cat !== props.todo.category)
})

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

const getCategoryLabel = (category: TodoCategory): string => {
  const labels: Record<TodoCategory, string> = {
    [TodoCategory.Today]: 'Today',
    [TodoCategory.Next]: 'Next',
    [TodoCategory.SomeDay]: 'Someday',
  }
  return labels[category]
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex items-center gap-3 p-2 rounded-md group transition-all hover:( outline-gray-900/20 ) outline-1 -outline-offset-1- outline-dashed outline-transparent"
    :class="[classesTodoStatus[todo.status]]"
    @mouseleave="handleContainerMouseLeave"
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

    <div
      v-if="!isEditing"
      @dblclick="handleDoubleClick"
      class="text-sm flex-1 select-none cursor-text rounded py-0.5"
      :class="{
        'line-through text-slate-400 font-normal':
          todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
        'text-emerald-700/70': todo.status === TodoStatus.Completed,
      }"
    >
      {{ todo.text }}
    </div>

    <input
      v-else
      ref="inputRef"
      v-model="editedText"
      @blur="handleEditSave"
      @keydown="handleKeydown"
      type="text"
      class="flex-1 text-sm bg-transparent outline-none"
      :class="{
        'line-through text-slate-400 font-normal':
          todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
        'text-emerald-700/70': todo.status === TodoStatus.Completed,
      }"
    />

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="relative">
        <button
          @click="showCategoryMenu = !showCategoryMenu"
          class="flex p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
          title="Transfer to category"
        >
          <em class="i-lucide-arrow-right-circle w-4 h-4" />
        </button>

        <div
          v-if="showCategoryMenu"
          class="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max"
        >
          <button
            v-for="category in isTransferable"
            :key="category"
            @click="handleTransferCategory(category)"
            class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors first:rounded-t-md last:rounded-b-md"
          >
            {{ getCategoryLabel(category) }}
          </button>
        </div>
      </div>

      <button
        @click="handleDelete"
        class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all flex"
        title="Delete task"
      >
        <em class="i-lucide-trash-2 w-4 h-4" />
      </button>
    </div>
  </div>
</template>
