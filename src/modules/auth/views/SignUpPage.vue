<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)

const loading = ref(false)
const errMsg = ref('')

const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    const errorCode = error.code
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address',
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/operation-not-allowed': 'Sign up is not enabled',
      'auth/too-many-requests':
        'Too many attempts. Please try again later',
    }
    return errorMessages[errorCode] || 'Sign up failed. Please try again'
  }
  return 'Sign up failed. Please try again'
}

const validateForm = (): string => {
  if (password.value.length < 6) {
    return 'Password must be at least 6 characters'
  }
  if (password.value !== confirmPassword.value) {
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
    await authStore.signup(email.value, password.value, rememberMe.value)
    router.push('/')
  } catch (error) {
    console.error('Sign up error:', error)
    errMsg.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

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

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-8 sm:px-6"
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-mail w-5 h-5" />
            </span>
            <input
              v-model="email"
              type="email"
              required
              :disabled="loading"
              placeholder="you@email.com"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-lock w-5 h-5" />
            </span>
            <input
              v-model="password"
              type="password"
              required
              :disabled="loading"
              placeholder="Minimum 6 characters"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <p class="mt-1.5 text-xs text-gray-500">Minimum 6 characters for your security</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-lock w-5 h-5" />
            </span>
            <input
              v-model="confirmPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

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
          :disabled="loading || !email || !password || !confirmPassword"
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
