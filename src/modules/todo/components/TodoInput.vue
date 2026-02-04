<script setup lang="ts">
import { useTemplateRef, type MaybeRef } from 'vue'
import type { WeekDayIndex } from '../domain/todo.entity'
import { useTextareaAutosize } from '@vueuse/core'

const props = defineProps<{
  // modelValue: string
  dayIndex: WeekDayIndex
  disabled?: boolean
}>()

const model = defineModel<string>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [dayIndex: WeekDayIndex]
}>()

const inputRef = useTemplateRef<HTMLTextAreaElement>('inputRef')

const handleKeyDown = (event: KeyboardEvent): void => {
  // if (event.key === 'Enter' && !event.shiftKey) {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleSubmit = (): void => {
  // if (!props.modelValue.trim()) return
  if (!model.value?.trim()) return
  emit('submit', props.dayIndex)
}

// const handleInput = (event: Event): void => {
//   const target = event.target as HTMLInputElement
//   emit('update:modelValue', target.value)
// }

const focus = (): void => {
  inputRef.value?.focus()
}

defineExpose({ focus })
//
const modelInput = model as MaybeRef<string> | undefined
useTextareaAutosize({
  element: inputRef,
  input: modelInput,
})
</script>

<template>
  <div class="flex gap-2">
    <textarea
      v-model="model"
      ref="inputRef"
      @keydown="handleKeyDown"
      :disabled="disabled"
      type="text"
      placeholder="New task..."
      class="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
    />
  </div>
</template>

<style scoped>
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::-webkit-scrollbar {
  display: none;
}
</style>
