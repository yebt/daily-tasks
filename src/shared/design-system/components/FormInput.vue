<script setup lang="ts">
interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  icon?: string
  error?: string
  helperText?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineEmits<Emits>()

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <div class="relative">
      <span v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
        <em :class="icon" class="w-5 h-5" />
      </span>

      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full border rounded-lg focus:ring-2 focus:border-slate-800 outline-none transition',
          'py-2.5 sm:py-3',
          icon ? 'pl-10' : 'pl-4',
          error
            ? 'pr-10 border-red-300 focus:ring-red-500/20'
            : 'pr-4 border-gray-300 focus:ring-slate-800/20',
          'disabled:bg-gray-50 disabled:text-gray-500',
        ]"
      />

      <em
        v-if="error"
        class="i-lucide-alert-circle absolute inset-y-0 right-3 flex items-center w-5 h-5 text-red-600"
      />
    </div>

    <transition name="slide-fade">
      <p v-if="error" class="mt-1.5 text-xs text-red-600">
        {{ error }}
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
