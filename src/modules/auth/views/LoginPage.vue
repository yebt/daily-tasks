<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const mail = ref('')
const pass = ref('')
const rememerMe = ref(false)

const loading = ref(false)
const errMsg = ref('')

const handleLogin = async function () {
  try {
    loading.value = true
    await authStore.login(mail.value, pass.value, rememerMe.value)
    router.push('/')
  } catch (error) {
    console.error('Access Error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-col items-center mb-6">
        <div class="i-lucide-user-round w-12 h-12 text-slate-800 mb-2" />
        <h2 class="text-2xl font-bold text-gray-800">Sign in</h2>
        <p class="text-sm text-center text-gray-500 mt-1">
          Welcome back. Please enter your credentials.
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-mail w-5 h-5" />
            </span>
            <input
              v-model="mail"
              type="email"
              required
              placeholder="you@email.com"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <div class="i-lucide-lock w-5 h-5" />
            </span>
            <input
              v-model="pass"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition"
            />
          </div>
          <p v-if="errMsg" class="mt-2 text-xs text-red-500">{{ errMsg }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              v-model="rememerMe"
              class="rounded border-gray-300 text-slate-800 focus:ring-slate-800"
            />
            Remember me
          </label>

          <RouterLink :to="{ name: 'forgot-password' }" class="text-slate-800 hover:underline">
            Forgot password?
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 active:scale-95 disabled:opacity-50 transition"
        >
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
