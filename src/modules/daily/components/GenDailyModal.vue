<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@modules/todo/store/todo.store'
import { useSettingsStore } from '@modules/settings/store/settings.store'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { useDailyStore } from '../store/daily.store'
import { geminiService } from '../services/gemini.service'
import { TodoCategory, TodoStatus } from '@modules/todo/domain/todo.entity'

interface AvailableModel {
  name: string
  displayName: string
  description: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<{
  isOpen: boolean
  openDayIndex: number
}>()

const emit = defineEmits<Emits>()

const router = useRouter()
const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const dailyStore = useDailyStore()

const includeIncomplete = ref(false)
const isGenerating = ref(false)
const error = ref<string | null>(null)
const isLoadingSettings = ref(false)
const isLoadingModels = ref(false)
const availableModels = ref<AvailableModel[]>([])
const selectedModel = ref<string>('gemini-1.5-flash')

// Load settings and available models when modal opens
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && authStore.user) {
      isLoadingSettings.value = true
      isLoadingModels.value = true
      error.value = null

      try {
        await settingsStore.loadSettings()

        // Load available models if API key is configured
        if (settingsStore.geminiApiKey) {
          try {
            geminiService.setApiKey(settingsStore.geminiApiKey)
            const models = await geminiService.getAvailableModels()
            availableModels.value = models
            // Set the first model as default
            if (models.length > 0 && models[0]) {
              selectedModel.value = models[0].name
            }
          } catch (err) {
            console.error('Failed to load models:', err)
            error.value = 'Failed to load available models'
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        isLoadingSettings.value = false
        isLoadingModels.value = false
      }
    }
  },
)

const getTodayTasks = () => {
  return todoStore
    .getTodosByDay(props.openDayIndex)
    .filter((t) => t.category === TodoCategory.Today)
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

  if (isLoadingSettings.value || isLoadingModels.value) {
    error.value = 'Loading settings and models...'
    return
  }

  if (!settingsStore.geminiApiKey) {
    error.value = 'Gemini API key not configured. Please add it in settings.'
    return
  }

  isGenerating.value = true
  error.value = null

  try {
    // Set the API key and selected model for the gemini service
    geminiService.setApiKey(settingsStore.geminiApiKey)
    geminiService.setModel(selectedModel.value)

    // Get tasks to include
    let tasksToInclude = getTodayTasks()

    // If includeIncomplete is checked, also include incomplete tasks from the same day
    if (includeIncomplete.value) {
      const allDayTasks = todoStore.getTodosByDay(props.openDayIndex)
      const incompleteTasksFromDay = allDayTasks.filter(
        (t) =>
          t.category === TodoCategory.Today &&
          t.status !== TodoStatus.Completed &&
          t.status !== TodoStatus.Cancel &&
          !tasksToInclude.find((existing) => existing.id === t.id),
      )
      tasksToInclude = [...tasksToInclude, ...incompleteTasksFromDay]
    }

    const tasksIncluded = tasksToInclude.map((t) => t.id!).filter(Boolean)

    // Generate content using Gemini
    const content = await geminiService.generateDaily(settingsStore.dailyTemplate, tasksToInclude)

    // Save to store and Firebase
    if (!authStore.user?.uid) throw new Error('User not authenticated')

    const createdDaily = await dailyStore.createDaily({
      userId: authStore.user.uid,
      content,
      template: settingsStore.dailyTemplate,
      includeIncomplete: includeIncomplete.value,
      tasksIncluded,
    })

    emit('close')

    // Redirect to the newly created daily
    await router.push(`/daily/${createdDaily.id}`)
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
      <div class="flex items-center justify-between mb-4 flex items-start">
        <h2 class="text-xl font-bold text-gray-900">Generate Daily</h2>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex"
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
            <span class="text-sm text-gray-700"> Include incomplete tasks from the same day </span>
          </label>
          <p class="mt-2 text-xs text-gray-500">
            This will include unfinished tasks from the current day that are not completed or
            cancelled
          </p>
        </div>

        <div>
          <label for="model-select" class="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <select
            id="model-select"
            v-model="selectedModel"
            :disabled="isLoadingModels || availableModels.length === 0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option v-if="isLoadingModels" value="">Loading models...</option>
            <option v-else-if="availableModels.length === 0" value="">No models available</option>
            <option v-for="model in availableModels" :key="model.name" :value="model.name">
              {{ model.displayName }}
            </option>
          </select>
          <p v-if="selectedModel && availableModels.length > 0" class="mt-2 text-xs text-gray-500">
            {{
              availableModels.find((m) => m.name === selectedModel)?.description ||
              'No description available'
            }}
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
          :disabled="
            isGenerating ||
            !canGenerate() ||
            isLoadingSettings ||
            isLoadingModels ||
            availableModels.length === 0
          "
          class="flex-1 px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <em
            v-if="isGenerating || isLoadingSettings || isLoadingModels"
            class="i-lucide-loader-2 w-4 h-4 animate-spin"
          />
          {{
            isLoadingSettings || isLoadingModels
              ? 'Loading...'
              : isGenerating
                ? 'Generating...'
                : 'Generate'
          }}
        </button>
      </div>
    </div>
  </div>
</template>
