<script setup lang="ts">
import { ref } from 'vue'
import type { WeekDayIndex } from '../domain/todo.entity'

const props = defineProps<{
  modelValue: string
  dayIndex: WeekDayIndex
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [dayIndex: WeekDayIndex]
}>()

const inputRef = ref<HTMLInputElement>()

const handleSubmit = (): void => {
  if (!props.modelValue.trim()) return
  emit('submit', props.dayIndex)
}

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const focus = (): void => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="flex gap-2">
    <input
      ref="inputRef"
      :value="modelValue"
      @keyup.enter="handleSubmit"
      @input="handleInput"
      :disabled="disabled"
      type="text"
      placeholder="New task..."
      class="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
</template>
