<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { useDailyStore } from '../store/daily.store'
import type { Daily } from '../domain/daily.entity'
import { useConfirmModal } from '@shared/design-system/composables/useConfirmModal'
import ConfirmModal from '@shared/design-system/components/ConfirmModal.vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const dailyStore = useDailyStore()
const confirmModal = useConfirmModal()

const selectedDaily = ref<Daily | null>(null)
const copiedId = ref<string | null>(null)
const isDeletingBatch = ref(false)
const selectedIds = ref<Set<string>>(new Set())

const selectAll = computed({
  get: () => selectedIds.value.size === dailyStore.dailies.length && dailyStore.dailies.length > 0,
  set: (value) => {
    if (value) {
      selectedIds.value = new Set(dailyStore.dailies.map((d) => d.id))
    } else {
      selectedIds.value.clear()
    }
  },
})

// Fetch dailies when modal opens
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && authStore.user?.uid) {
      await dailyStore.fetchDailies(authStore.user.uid)
    }
  },
)

const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const copyToClipboard = async (content: string, dailyId: string) => {
  try {
    await navigator.clipboard.writeText(content)
    copiedId.value = dailyId
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleDeleteDaily = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Delete Daily',
    message: 'Are you sure you want to delete this daily?',
    confirmText: 'Delete',
    isDangerous: true,
  })

  if (confirmed) {
    try {
      await dailyStore.deleteDaily(id)
    } catch (error) {
      console.error('Error deleting daily:', error)
    }
  }
}

const handleDeleteBatch = async () => {
  if (selectedIds.value.size === 0) return

  const confirmed = await confirmModal.confirm({
    title: 'Delete Dailies',
    message: `Delete ${selectedIds.value.size} daily(ies)?`,
    confirmText: 'Delete',
    isDangerous: true,
  })

  if (confirmed) {
    isDeletingBatch.value = true
    try {
      await dailyStore.deleteDailiesBatch(Array.from(selectedIds.value))
      selectedIds.value.clear()
    } catch (error) {
      console.error('Error deleting dailies:', error)
    } finally {
      isDeletingBatch.value = false
    }
  }
}

const handleClose = () => {
  selectedDaily.value = null
  selectedIds.value.clear()
  copiedId.value = null
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :is-dangerous="confirmModal.isDangerous"
      @confirm="confirmModal.handleConfirm()"
      @cancel="confirmModal.handleCancel()"
    />

    <div
      class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Daily History</h2>
        <button
          @click="handleClose"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <em class="i-lucide-x w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="dailyStore.dailies.length === 0" class="text-center py-12">
          <em class="i-lucide-inbox w-12 h-12 mx-auto text-gray-300 mb-4 block" />
          <p class="text-gray-500">No dailies yet. Generate one to get started!</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-if="selectedIds.size > 0"
            class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg sticky top-0 z-10"
          >
            <input
              v-model="selectAll"
              type="checkbox"
              class="w-4 h-4 rounded cursor-pointer accent-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">{{ selectedIds.size }} selected</span>

            <div class="flex-1" />

            <button
              @click="handleDeleteBatch"
              :disabled="isDeletingBatch"
              class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              <em class="i-lucide-trash-2 w-4 h-4" />
              Delete
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="daily in dailyStore.dailies"
              :key="daily.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start gap-3 mb-2 flex item items-center">
                <input
                  :checked="selectedIds.has(daily.id)"
                  @change="toggleSelect(daily.id)"
                  type="checkbox"
                  class="w-4 h-4 rounded cursor-pointer accent-blue-500 mt-1"
                />

                <div class="flex-1">
                  <RouterLink
                    class="hover:(text-blue-600 underline) transition "
                    :to="{ name: 'daily-view', params: { id: daily.id } }">
                    {{ daily.id }}
                  </RouterLink>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatDate(daily.createdAt) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ daily.tasksIncluded.length }} task(s) included
                  </p>
                </div>

                <div class="flex gap-2 items-baseline">
                  <button
                    @click="copyToClipboard(daily.content, daily.id)"
                    :class="[
                      'p-2 rounded transition-all flex',
                      copiedId === daily.id
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50',
                    ]"
                    :title="copiedId === daily.id ? 'Copied!' : 'Copy to clipboard'"
                  >
                    <em
                      :class="copiedId === daily.id ? 'i-lucide-check' : 'i-lucide-copy'"
                      class="w-4 h-4"
                    />
                  </button>

                  <button
                    @click="handleDeleteDaily(daily.id)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all flex"
                    title="Delete daily"
                  >
                    <em class="i-lucide-trash-2 w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                v-if="selectedDaily?.id === daily.id"
                class="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 max-h-48 overflow-y-auto"
              >
                <div class="whitespace-pre-wrap font-mono text-xs">{{ daily.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
