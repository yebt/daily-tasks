<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDailyStore } from '../store/daily.store'
import type { Daily } from '../domain/daily.entity'

const route = useRoute()
const router = useRouter()
const dailyStore = useDailyStore()

const daily = ref<Daily | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isCopied = ref(false)

const dailyId = computed(() => route.params.id as string)

const loadDaily = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    // Find the daily in the store
    const foundDaily = dailyStore.dailies.find((d) => d.id === dailyId.value)

    if (!foundDaily) {
      error.value = 'Daily not found'
      return
    }

    daily.value = foundDaily
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load daily'
    console.error('Error loading daily:', err)
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (): Promise<void> => {
  if (!daily.value?.content) return

  try {
    await navigator.clipboard.writeText(daily.value.content)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    error.value = 'Failed to copy to clipboard'
    console.error('Copy error:', err)
  }
}

const goBack = (): void => {
  router.back()
}

onMounted(() => {
  loadDaily()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <em class="i-lucide-arrow-left w-5 h-5" />
            </button>
            <div>
              <h1 v-if="daily" class="text-2xl font-bold text-gray-900">{{ daily.title }}</h1>
              <div v-else-if="loading" class="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <button
            v-if="daily"
            @click="copyToClipboard"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              isCopied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700',
            ]"
          >
            <em :class="['w-4 h-4', isCopied ? 'i-lucide-check' : 'i-lucide-copy']" />
            {{ isCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div class="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div class="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
        <div class="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 font-medium">{{ error }}</p>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>

      <!-- Daily Content -->
      <div v-else-if="daily" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <!-- Render markdown-like content -->
          <div class="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
            {{ daily.content }}
          </div>
        </div>

        <!-- Metadata -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p class="font-medium text-gray-900">Generated At</p>
              <p>{{ new Date(daily.generatedAt).toLocaleString() }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-900">Tasks Included</p>
              <p>{{ daily.tasksIncluded.length }} task(s)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
