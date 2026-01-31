<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  password: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  helperText?: string
  showIcon?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineEmits<Emits>()

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  showIcon: true,
})

const showPassword = ref(false)

const passwordsMatch = computed(() => props.modelValue === props.password)
const hasContent = computed(() => props.modelValue.length > 0 && props.password.length > 0)
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <div class="relative">
      <span v-if="showIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
        <em class="i-lucide-lock w-5 h-5" />
      </span>

      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full border rounded-lg focus:ring-2 focus:border-slate-800 outline-none transition',
          'py-2.5 sm:py-3 pl-10 pr-20',
          hasContent
            ? passwordsMatch
              ? 'border-green-300 focus:ring-green-500/20'
              : 'border-red-300 focus:ring-red-500/20'
            : 'border-gray-300 focus:ring-slate-800/20',
          'disabled:bg-gray-50 disabled:text-gray-500',
        ]"
      />

      <div class="absolute inset-y-0 right-3 flex items-center gap-2">
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          :disabled="disabled"
        >
          <em :class="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-5 h-5" />
        </button>
        <em
          v-if="hasContent"
          :class="passwordsMatch ? 'i-lucide-check-circle text-green-600' : 'i-lucide-x-circle text-red-600'"
          class="w-5 h-5"
        />
      </div>
    </div>

    <transition name="slide-fade">
      <p v-if="hasContent && !passwordsMatch" class="mt-1.5 text-xs text-red-600">
        Passwords do not match
      </p>
    </transition>

    <p v-if="helperText" class="mt-1.5 text-xs text-gray-500">
      {{ helperText }}
    </p>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
