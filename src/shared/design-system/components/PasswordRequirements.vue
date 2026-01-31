<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  password: string
  minLength?: number
}

interface PasswordRequirements {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  digit: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minLength: 8,
})

const requirements = computed<PasswordRequirements>(() => ({
  length: props.password.length >= (props.minLength || 8),
  uppercase: /[A-Z]/.test(props.password),
  lowercase: /[a-z]/.test(props.password),
  digit: /\d/.test(props.password),
}))
</script>

<template>
  <div class="space-y-2">
    <div
      :class="[
        'flex items-center gap-2 text-xs transition-colors',
        requirements.length ? 'text-green-600' : 'text-gray-400',
      ]"
    >
      <em
        :class="requirements.length ? 'i-lucide-check-circle' : 'i-lucide-circle'"
        class="w-4 h-4"
      />
      At least {{ minLength }} characters
    </div>

    <div
      :class="[
        'flex items-center gap-2 text-xs transition-colors',
        requirements.uppercase ? 'text-green-600' : 'text-gray-400',
      ]"
    >
      <em
        :class="requirements.uppercase ? 'i-lucide-check-circle' : 'i-lucide-circle'"
        class="w-4 h-4"
      />
      At least one uppercase letter (A-Z)
    </div>

    <div
      :class="[
        'flex items-center gap-2 text-xs transition-colors',
        requirements.lowercase ? 'text-green-600' : 'text-gray-400',
      ]"
    >
      <em
        :class="requirements.lowercase ? 'i-lucide-check-circle' : 'i-lucide-circle'"
        class="w-4 h-4"
      />
      At least one lowercase letter (a-z)
    </div>

    <div
      :class="[
        'flex items-center gap-2 text-xs transition-colors',
        requirements.digit ? 'text-green-600' : 'text-gray-400',
      ]"
    >
      <em
        :class="requirements.digit ? 'i-lucide-check-circle' : 'i-lucide-circle'"
        class="w-4 h-4"
      />
      At least one number (0-9)
    </div>
  </div>
</template>
