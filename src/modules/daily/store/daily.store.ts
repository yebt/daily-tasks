import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { DailyService } from '../services/daily.service'
import type { Daily } from '../domain/daily.entity'
import { DEFAULT_DAILY_TEMPLATE } from '../domain/daily.entity'

export const useDailyStore = defineStore('daily', () => {
  const dailies = ref<Daily[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const template = ref(DEFAULT_DAILY_TEMPLATE)

  const sortedDailies = computed(() => {
    return [...dailies.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  const fetchDailies = async (userId: string): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      dailies.value = await DailyService.getDailysByUser(userId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch dailies'
      console.error('Error fetching dailies:', e)
    } finally {
      loading.value = false
    }
  }

  const createDaily = async (
    daily: Omit<Daily, 'id' | 'createdAt' | 'generatedAt'>,
  ): Promise<void> => {
    try {
      const id = await DailyService.createDaily(daily)
      dailies.value.unshift({
        ...daily,
        id,
        createdAt: Date.now(),
        generatedAt: Date.now(),
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create daily'
      console.error('Error creating daily:', e)
      throw e
    }
  }

  const deleteDaily = async (id: string): Promise<void> => {
    try {
      await DailyService.deleteDaily(id)
      dailies.value = dailies.value.filter((d) => d.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete daily'
      console.error('Error deleting daily:', e)
      throw e
    }
  }

  const deleteDailiesBatch = async (ids: string[]): Promise<void> => {
    try {
      await DailyService.deleteDailiesBatch(ids)
      dailies.value = dailies.value.filter((d) => !ids.includes(d.id!))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete dailies'
      console.error('Error deleting dailies:', e)
      throw e
    }
  }

  const setTemplate = (newTemplate: string): void => {
    template.value = newTemplate
  }

  return {
    dailies: computed(() => sortedDailies.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    template: computed(() => template.value),
    fetchDailies,
    createDaily,
    deleteDaily,
    deleteDailiesBatch,
    setTemplate,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDailyStore, import.meta.hot))
}
