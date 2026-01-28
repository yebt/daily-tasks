import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SettingsService } from '../services/settings.service'
import type { Settings } from '../domain/settings.entity'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()

  const settings = ref<Settings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const geminiApiKey = computed(() => settings.value?.geminiApiKey || '')

  const loadSettings = async () => {
    if (!authStore.user?.uid) return

    isLoading.value = true
    error.value = null

    try {
      const data = await SettingsService.getSettings(authStore.user.uid)
      settings.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading settings'
      console.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  const updateGeminiApiKey = async (apiKey: string) => {
    if (!authStore.user?.uid) return

    isLoading.value = true
    error.value = null

    try {
      await SettingsService.updateGeminiApiKey(authStore.user.uid, apiKey)
      if (settings.value) {
        settings.value.geminiApiKey = apiKey
      } else {
        settings.value = {
          userId: authStore.user.uid,
          geminiApiKey: apiKey,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating settings'
      console.error(error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    error,
    geminiApiKey,
    loadSettings,
    updateGeminiApiKey,
  }
})
