<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const mail = ref('')
const loading = ref(false)
const sent = ref(false)
const errMsg = ref('')

const handleReset = async function () {
  if (!mail.value) return

  try {
    loading.value = true
    errMsg.value = ''
    await authStore.resetPassword(mail.value)
    sent.value = true
  } catch (error) {
    errMsg.value = 'Email could not be sent. Please verify your email address.'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <!-- Success state -->
      <div v-if="sent" class="text-center animate-fade-in">
        <div class="i-lucide-mail-check w-16 h-16 text-slate-800 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-800">Email sent</h2>
        <p class="text-gray-500 mt-2">Check your inbox to reset your password.</p>
        <button
          @click="router.push({ name: 'login' })"
          class="mt-6 w-full py-2.5 text-slate-800 font-medium hover:underline"
        >
          Back to login
        </button>
      </div>

      <!-- Form state -->
      <div v-else>
        <div class="flex flex-col items-center mb-6">
          <div class="i-lucide-key-round w-12 h-12 text-slate-800 mb-2" />
          <h2 class="text-2xl font-bold text-gray-800">Forgot your password?</h2>
          <p class="text-sm text-center text-gray-500 mt-1">
            Enter your email and we’ll send you a recovery link.
          </p>
        </div>

        <form @submit.prevent="handleReset" class="space-y-4">
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
            <p v-if="errMsg" class="mt-2 text-xs text-red-500">{{ errMsg }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 active:scale-95 disabled:opacity-50 transition"
          >
            {{ loading ? 'Sending…' : 'Send instructions' }}
          </button>

          <RouterLink
            :to="{ name: 'login' }"
            class="w-full text-sm text-gray-500 hover:text-gray-700 transition hover:underline"
          >
            Cancel and go back
          </RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>
