<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../store/settings.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { DEFAULT_DAILY_TEMPLATE } from '@modules/daily/domain/daily.entity'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const apiKeyInput = ref('')
const templateInput = ref('')
const apiKeyVisible = ref(false)
const isSaving = ref(false)
const activeTab = ref<'api' | 'template'>('api')

const isModified = computed(
  () =>
    apiKeyInput.value !== settingsStore.geminiApiKey ||
    templateInput.value !== settingsStore.dailyTemplate,
)

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && authStore.user) {
      await settingsStore.loadSettings()
      apiKeyInput.value = settingsStore.geminiApiKey
      templateInput.value = settingsStore.dailyTemplate
    } else if (!newVal) {
      // When modal closes, reset the input to the current store value
      apiKeyInput.value = settingsStore.geminiApiKey
      templateInput.value = settingsStore.dailyTemplate
    }
  },
  { immediate: true },
)

const handleSave = async () => {
  isSaving.value = true
  try {
    if (apiKeyInput.value !== settingsStore.geminiApiKey) {
      await settingsStore.updateGeminiApiKey(apiKeyInput.value.trim())
    }
    if (templateInput.value !== settingsStore.dailyTemplate) {
      await settingsStore.updateDailyTemplate(templateInput.value)
    }
    emit('close')
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  apiKeyInput.value = settingsStore.geminiApiKey
  templateInput.value = settingsStore.dailyTemplate
  emit('close')
}

const resetTemplate = () => {
  templateInput.value = DEFAULT_DAILY_TEMPLATE
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div
      class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Settings</h2>
        <button
          @click="emit('close')"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <em class="i-lucide-x w-5 h-5" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-4 px-6 pt-4 border-b border-gray-200">
        <button
          @click="activeTab = 'api'"
          :class="[
            'pb-4 px-3 font-medium text-sm transition-colors border-b-2',
            activeTab === 'api'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900',
          ]"
        >
          Gemini API
        </button>
        <button
          @click="activeTab = 'template'"
          :class="[
            'pb-4 px-3 font-medium text-sm transition-colors border-b-2',
            activeTab === 'template'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900',
          ]"
        >
          Daily Template
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- API Key Tab -->
        <div v-if="activeTab === 'api'" class="space-y-4">
          <div>
            <label for="gemini-api-key" class="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div class="relative">
              <input
                id="gemini-api-key"
                v-model="apiKeyInput"
                :type="apiKeyVisible ? 'text' : 'password'"
                placeholder="Enter your Gemini API key"
                class="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition pr-10"
              />
              <button
                @click="apiKeyVisible = !apiKeyVisible"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <em :class="apiKeyVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Your API key is stored securely in Firestore</p>
          </div>

          <div v-if="settingsStore.error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ settingsStore.error }}</p>
          </div>
        </div>

        <!-- Template Tab -->
        <div v-if="activeTab === 'template'" class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="daily-template" class="block text-sm font-medium text-gray-700">
                Daily Generation Template
              </label>
              <button
                @click="resetTemplate"
                class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Reset to default
              </button>
            </div>
            <textarea
              id="daily-template"
              v-model="templateInput"
              rows="12"
              placeholder="Enter your daily template..."
              class="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-mono"
            />
            <p class="mt-2 text-xs text-gray-500">
              Use <code class="bg-gray-100 px-1 rounded">&#x7b;&#x7b;fecha&#x7d;&#x7d;</code> for
              current date and
              <code class="bg-gray-100 px-1 rounded">&#x7b;&#x7b;tareas&#x7d;&#x7d;</code> to
              include task list
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t border-gray-200 p-6 flex gap-3">
        <button
          @click="handleCancel"
          :disabled="!isModified || isSaving"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!isModified || isSaving"
          class="flex-1 px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <em v-if="isSaving" class="i-lucide-loader-2 w-4 h-4 animate-spin" />
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
