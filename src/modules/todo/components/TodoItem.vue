<script setup lang="ts">
import { ref, nextTick, computed, useTemplateRef, toRef } from 'vue'
import {
  getTodoStatusIcon,
  TodoStatus,
  TodoStatuses,
  TodoCategory,
  type Todo,
} from '../domain/todo.entity'
import { onClickOutside, useTextareaAutosize } from '@vueuse/core'

interface Props {
  todo: Todo
}

const { textarea, input } = useTextareaAutosize()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:status': [status: string]
  'update:text': [text: string]
  'update:category': [category: TodoCategory]
  delete: []
}>()

const todoElemnt = toRef(props, 'todo')

const isEditing = ref(false)
// const editedText = ref(props.todo.text)
input.value = todoElemnt.value.text

const showCategoryMenu = ref(false)
const showStatusMenu = ref(false)

// const inputRef = useTemplateRef('inputRef')
const statusMenuRef = useTemplateRef('statusMenuRef')
const categoryMenuRef = useTemplateRef('categoryMenuRef')
const statusButtonRef = useTemplateRef('statusButtonRef')
const categoryButtonRef = useTemplateRef('categoryButtonRef')

const statusMenuPositionTop = ref(true)
const categoryMenuPositionTop = ref(true)

const getStatusIcon = (statusValue: TodoStatus): string => {
  return getTodoStatusIcon(statusValue)
}

const handleStatusChange = (newStatus: string) => {
  emit('update:status', newStatus)
  showStatusMenu.value = false
}

const handleDelete = () => {
  emit('delete')
}

const handleDoubleClick = async () => {
  isEditing.value = true
  // editedText.value = props.todo.text
  // input.value = props.todo.text
  input.value = todoElemnt.value.text
  await nextTick()
  textarea.value?.focus()
  // inputRef.value?.select()
}

const handleEditSave = () => {
  const trimmedText = input.value.trim()
  if (trimmedText && trimmedText !== props.todo.text) {
    emit('update:text', trimmedText)
  }
  isEditing.value = false
  showCategoryMenu.value = false
  // ten temporally
  todoElemnt.value.text = trimmedText
}

const handleEditCancel = () => {
  isEditing.value = false
  input.value = props.todo.text
  showCategoryMenu.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  // shift enter to add new line
  if (e.key === 'Enter' && e.shiftKey) {
    return
  }

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
  showStatusMenu.value = false
}

const calculateStatusMenuPosition = async () => {
  await nextTick()
  if (!statusButtonRef.value || !statusMenuRef.value) return

  const buttonRect = statusButtonRef.value.getBoundingClientRect()
  const menuHeight = statusMenuRef.value.offsetHeight
  const windowHeight = window.innerHeight

  // Si hay espacio abajo, posicionar abajo. Si no, posicionar arriba
  statusMenuPositionTop.value = buttonRect.bottom + menuHeight + 10 < windowHeight
}

const calculateCategoryMenuPosition = async () => {
  await nextTick()
  if (!categoryButtonRef.value || !categoryMenuRef.value) return

  const buttonRect = categoryButtonRef.value.getBoundingClientRect()
  const menuHeight = categoryMenuRef.value.offsetHeight
  const windowHeight = window.innerHeight

  // Si hay espacio abajo, posicionar abajo. Si no, posicionar arriba
  categoryMenuPositionTop.value = buttonRect.bottom + menuHeight + 10 < windowHeight
}

const handleStatusMenuOpen = async () => {
  showStatusMenu.value = !showStatusMenu.value
  if (showStatusMenu.value) {
    await calculateStatusMenuPosition()
  }
}

const handleCategoryMenuOpen = async () => {
  showCategoryMenu.value = !showCategoryMenu.value
  if (showCategoryMenu.value) {
    await calculateCategoryMenuPosition()
  }
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

//
onClickOutside(textarea, () => {
  if (isEditing.value) {
    handleEditSave()
  }
})
</script>

<template>
  <div
    :class="[
      classesTodoStatus[todo.status],
      isEditing
        ? 'bg-white shadow-md ring-2 ring-blue-400/30'
        : 'hover:( outline-gray-900/20 ) outline-1 -outline-offset-1- outline-dashed outline-transparent',
    ]"
    class="flex items-center gap-3 p-2 rounded-md group transition-all"
    @mouseleave="handleContainerMouseLeave"
  >
    <div class="relative flex items-center justify-center">
      <button
        ref="statusButtonRef"
        @click="handleStatusMenuOpen"
        class="relative flex items-center justify-center w-6 h-6 rounded transition-all hover:bg-gray-100/50"
        :title="`Status: ${statuses.find((s) => s.value === todo.status)?.label}`"
      >
        <em
          :class="[getStatusIcon(todo.status), classesTodoStatusIcon[todo.status]]"
          class="w-4 h-4 group-hover:text-blue-500 drop-shadow transition"
        />
      </button>

      <div
        v-if="showStatusMenu"
        ref="statusMenuRef"
        :class="[
          'absolute left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-max',
          statusMenuPositionTop ? 'top-full mt-1' : 'bottom-full mb-1',
        ]"
      >
        <button
          v-for="status in statuses"
          :key="status.value"
          @click="handleStatusChange(status.value)"
          class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors first:rounded-t-md last:rounded-b-md"
          :class="{ 'bg-blue-100/50': status.value === todo.status }"
        >
          <em
            :class="[status.icon, classesTodoStatusIcon[status.value as TodoStatus]]"
            class="w-4 h-4"
          />
          <span>{{ status.label }}</span>
        </button>
      </div>
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
      <span></span>
      <!-- {{ todo.text }} -->
      {{ todoElemnt.text }}
    </div>

    <textarea
      v-if="isEditing"
      ref="textarea"
      v-model="input"
      @keydown="handleKeydown"
      class="flex-1 text-sm bg-transparent outline-none py-0.5 resize-none"
      :class="{
        'line-through text-slate-400 font-normal':
          todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
        'text-emerald-700/70': todo.status === TodoStatus.Completed,
      }"
    />

    <!-- <input -->
    <!--   v-if="isEditing" -->
    <!--   ref="inputRef" -->
    <!--   v-model="editedText" -->
    <!--   @blur="handleEditSave" -->
    <!--   @keydown="handleKeydown" -->
    <!--   type="text" -->
    <!--   class="flex-1 text-sm bg-transparent outline-none py-0.5" -->
    <!--   :class="{ -->
    <!--     'line-through text-slate-400 font-normal': -->
    <!--       todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed, -->
    <!--     'text-emerald-700/70': todo.status === TodoStatus.Completed, -->
    <!--   }" -->
    <!-- /> -->

    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="relative">
        <button
          ref="categoryButtonRef"
          @click="handleCategoryMenuOpen"
          class="flex p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
          title="Transfer to category"
        >
          <em class="i-lucide-arrow-right-circle w-4 h-4" />
        </button>

        <div
          v-if="showCategoryMenu"
          ref="categoryMenuRef"
          :class="[
            'absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max',
            categoryMenuPositionTop ? 'top-full mt-1' : 'bottom-full mb-1',
          ]"
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
