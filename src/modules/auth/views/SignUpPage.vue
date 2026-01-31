<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref, computed } from 'vue'
import { FirebaseError } from 'firebase/app'
import FormInput from '@shared/design-system/components/FormInput.vue'
import PasswordInput from '@shared/design-system/components/PasswordInput.vue'
import PasswordConfirmInput from '@shared/design-system/components/PasswordConfirmInput.vue'
import PasswordRequirements from '@shared/design-system/components/PasswordRequirements.vue'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)

const loading = ref(false)
const errMsg = ref('')

const isPasswordValid = computed<boolean>(() => {
  const req = {
    length: password.value.length >= 8,
    uppercase: /[A-Z]/.test(password.value),
    lowercase: /[a-z]/.test(password.value),
    digit: /\d/.test(password.value),
  }
  return req.length && req.uppercase && req.lowercase && req.digit
})

const passwordsMatch = computed<boolean>(() => password.value === confirmPassword.value)

const generateUsernameFromEmail = (emailAddress: string): string => {
  return emailAddress.split('@')[0] || emailAddress
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    const errorCode = error.code
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address',
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password does not meet requirements',
      'auth/operation-not-allowed': 'Sign up is not enabled',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
    }
    return errorMessages[errorCode] || 'Sign up failed. Please try again'
  }
  return 'Sign up failed. Please try again'
}

const validateForm = (): string => {
  if (!isPasswordValid.value) {
    return 'Password must meet all requirements'
  }
  if (!passwordsMatch.value) {
    return 'Passwords do not match'
  }
  return ''
}

const handleSignUp = async (): Promise<void> => {
  errMsg.value = ''

  const validationError = validateForm()
  if (validationError) {
    errMsg.value = validationError
    return
  }

  try {
    loading.value = true
    const generatedUsername = generateUsernameFromEmail(email.value)
    await authStore.signup(email.value, password.value, rememberMe.value, generatedUsername)
    router.push('/')
  } catch (error) {
    console.error('Sign up error:', error)
    errMsg.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-8 sm:px-6"
  >
    <div class="w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-col items-center mb-8">
        <div class="i-lucide-user-plus w-12 h-12 text-slate-800 mb-3" />
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800">Create account</h2>
        <p class="text-xs sm:text-sm text-center text-gray-500 mt-2">
          Join us and start organizing your tasks today.
        </p>
      </div>

      <!-- Error Alert -->
      <transition name="slide-fade">
        <div
          v-if="errMsg"
          class="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start"
        >
          <div class="i-lucide-alert-circle w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700">{{ errMsg }}</p>
        </div>
      </transition>

      <form @submit.prevent="handleSignUp" class="space-y-4 sm:space-y-5">
        <FormInput
          v-model="email"
          type="email"
          label="Email"
          icon="i-lucide-mail"
          placeholder="you@email.com"
          :disabled="loading"
          required
        />

        <div>
          <PasswordInput
            v-model="password"
            label="Password"
            placeholder="Create a strong password"
            :disabled="loading"
            required
          />

          <div class="mt-4">
            <PasswordRequirements :password="password" />
          </div>
        </div>

        <PasswordConfirmInput
          v-model="confirmPassword"
          :password="password"
          label="Confirm password"
          placeholder="••••••••"
          :disabled="loading"
          required
        />

        <label class="flex items-center gap-2 text-gray-600 cursor-pointer text-sm pt-2">
          <input
            type="checkbox"
            v-model="rememberMe"
            :disabled="loading"
            class="rounded border-gray-300 text-slate-800 focus:ring-slate-800 cursor-pointer disabled:opacity-50"
          />
          <span>Remember me on this device</span>
        </label>

        <button
          type="submit"
          :disabled="loading || !email || !isPasswordValid || !passwordsMatch"
          class="w-full py-3 sm:py-3.5 bg-slate-800 text-white text-base sm:text-lg rounded-lg font-semibold hover:bg-slate-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 mt-6"
        >
          <span v-if="!loading" class="flex items-center justify-center gap-2">
            <span>Create account</span>
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <div class="i-lucide-loader-2 w-5 h-5 animate-spin" />
            <span>Signing up…</span>
          </span>
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-center text-sm text-gray-600">
          Already have an account?
          <RouterLink
            :to="{ name: 'login' }"
            class="ml-1 text-slate-800 font-semibold hover:underline"
          >
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
