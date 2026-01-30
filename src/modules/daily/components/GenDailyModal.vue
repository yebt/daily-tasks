<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '@modules/todo/store/todo.store'
import { useSettingsStore } from '@modules/settings/store/settings.store'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { useDailyStore } from '../store/daily.store'
import { geminiService } from '../services/gemini.service'
import { TodoCategory } from '@modules/todo/domain/todo.entity'

interface Emits {
  (e: 'close'): void
}

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<Emits>()

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const dailyStore = useDailyStore()

const includeIncomplete = ref(false)
const isGenerating = ref(false)
const error = ref<string | null>(null)

const getTodayTasks = () => {
  return todoStore.todayTodos.filter((t) => t.category === TodoCategory.Today)
}

const canGenerate = () => {
  const todayTasks = getTodayTasks()
  const hasToday = todayTasks.length > 0

  // Can generate if:
  // 1. There are today tasks, OR
  // 2. includeIncomplete is checked (meaning we'll include all tasks)
  return hasToday || includeIncomplete.value
}

const handleGenerate = async () => {
  if (!canGenerate()) {
    error.value = 'No tasks to generate daily'
    return
  }

  if (!settingsStore.geminiApiKey) {
    error.value = 'Gemini API key not configured. Please add it in settings.'
    return
  }

  isGenerating.value = true
  error.value = null

  try {
    // Set the API key for the gemini service
    geminiService.setApiKey(settingsStore.geminiApiKey)

    // Get tasks to include
    let tasksToInclude = getTodayTasks()
    const tasksIncluded = tasksToInclude.map((t) => t.id!).filter(Boolean)

    if (includeIncomplete.value && tasksToInclude.length === 0) {
      // If includeIncomplete is checked but no today tasks, include all tasks
      tasksToInclude = [...todoStore.nextTodos, ...todoStore.someDayTodos]
    }

    // Generate content using Gemini
    const content = await geminiService.generateDaily(settingsStore.dailyTemplate, tasksToInclude)

    // Save to store and Firebase
    if (!authStore.user?.uid) throw new Error('User not authenticated')

    await dailyStore.createDaily({
      userId: authStore.user.uid,
      content,
      template: settingsStore.dailyTemplate,
      includeIncomplete: includeIncomplete.value,
      tasksIncluded,
    })

    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate daily'
    console.error('Error generating daily:', err)
  } finally {
    isGenerating.value = false
  }
}

const handleClose = () => {
  includeIncomplete.value = false
  error.value = null
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">Generate Daily</h2>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <em class="i-lucide-x w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Generate today's daily using AI with {{ getTodayTasks().length }} task(s) from "Today"
        </p>

        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="includeIncomplete"
              type="checkbox"
              class="w-4 h-4 rounded cursor-pointer accent-blue-500"
            />
            <span class="text-sm text-gray-700">
              Include incomplete tasks from other categories
            </span>
          </label>
          <p class="mt-2 text-xs text-gray-500">
            This will include tasks from "Next" and "Someday" categories
          </p>
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          :disabled="isGenerating"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleGenerate"
          :disabled="isGenerating || !canGenerate()"
          class="flex-1 px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <em v-if="isGenerating" class="i-lucide-loader-2 w-4 h-4 animate-spin" />
          {{ isGenerating ? 'Generating...' : 'Generate' }}
        </button>
      </div>
    </div>
  </div>
</template>
