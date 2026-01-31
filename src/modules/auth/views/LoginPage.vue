<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref } from 'vue'
import { FirebaseError } from 'firebase/app'

const authStore = useAuthStore()
const router = useRouter()

const mail = ref('')
const pass = ref('')
const rememerMe = ref(false)

const loading = ref(false)
const errMsg = ref('')

const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    const errorCode = error.code
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/user-disabled': 'This account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    }
    return errorMessages[errorCode] || 'Sign in failed. Please try again'
  }
  return 'Sign in failed. Please try again'
}

const handleLogin = async (): Promise<void> => {
  errMsg.value = ''
  try {
    loading.value = true
    await authStore.login(mail.value, pass.value, rememerMe.value)
    router.push('/')
  } catch (error) {
    console.error('Access Error:', error)
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
    class="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-8 sm:px-6"
  >
    <div class="w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-col items-center mb-8">
        <div class="i-lucide-user-round w-12 h-12 text-slate-800 mb-3" />
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800">Sign in</h2>
        <p class="text-xs sm:text-sm text-center text-gray-500 mt-2">
          Welcome back. Please enter your credentials.
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

      <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-mail w-5 h-5" />
            </span>
            <input
              v-model="mail"
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
              v-model="pass"
              type="password"
              required
              :disabled="loading"
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm pt-2"
        >
          <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              v-model="rememerMe"
              :disabled="loading"
              class="rounded border-gray-300 text-slate-800 focus:ring-slate-800 cursor-pointer disabled:opacity-50"
            />
            <span>Remember me</span>
          </label>

          <RouterLink
            :to="{ name: 'forgot-password' }"
            class="text-slate-800 hover:underline font-medium"
          >
            Forgot password?
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="loading || !mail || !pass"
          class="w-full py-3 sm:py-3.5 bg-slate-800 text-white text-base sm:text-lg rounded-lg font-semibold hover:bg-slate-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          <span v-if="!loading" class="flex items-center justify-center gap-2">
            <span>Sign in</span>
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <div class="i-lucide-loader-2 w-5 h-5 animate-spin" />
            <span>Signing in…</span>
          </span>
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink
            :to="{ name: 'sign-up' }"
            class="ml-1 text-slate-800 font-semibold hover:underline"
          >
            Sign up
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
