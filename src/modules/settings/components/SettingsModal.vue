<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../store/settings.store'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()

const settingsStore = useSettingsStore()
const apiKeyInput = ref('')
const apiKeyVisible = ref(false)
const isSaving = ref(false)

const isModified = computed(() => apiKeyInput.value !== settingsStore.geminiApiKey)

onMounted(() => {
  apiKeyInput.value = settingsStore.geminiApiKey
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await settingsStore.updateGeminiApiKey(apiKeyInput.value.trim())
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  apiKeyInput.value = settingsStore.geminiApiKey
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900">Settings</h2>
        <button
          @click="$emit('close')"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <em class="i-lucide-x w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
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

      <div class="flex gap-3 mt-6">
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
