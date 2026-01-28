<script setup lang="ts">
import { computed, unref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

interface Props {
  isOpen: MaybeRef<boolean>
  title: MaybeRef<string>
  message: MaybeRef<string>
  confirmText?: MaybeRef<string>
  cancelText?: MaybeRef<string>
  isDangerous?: MaybeRef<boolean>
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDangerous: false,
})

defineEmits<Emits>()

const confirmButtonClass = computed(() => ({
  'bg-red-500 hover:bg-red-600 text-white': unref(props.isDangerous),
  'bg-blue-500 hover:bg-blue-600 text-white': !unref(props.isDangerous),
}))
</script>

<template>
  <Teleport to="body">
    <div v-if="unref(isOpen)" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 space-y-4">
        <div class="space-y-2">
          <h2 class="text-lg font-bold text-gray-900">{{ unref(title) }}</h2>
          <p class="text-sm text-gray-600">{{ unref(message) }}</p>
        </div>

        <div class="flex gap-3 justify-end pt-4">
          <button @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            {{ unref(cancelText) }}
          </button>
          <button @click="$emit('confirm')" :class="confirmButtonClass"
            class="px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            {{ unref(confirmText) }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
