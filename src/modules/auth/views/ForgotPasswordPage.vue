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
    errMsg.value = "Mail don't send. Verify the email direction"
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-slate-800">Recover password</h1>
        <p class="text-sm text-slate-500 mt-1">Enter your email and we’ll send you a reset link</p>
      </div>
      <form class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" placeholder="you@example.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800" />
        </div>

        <button type="submit"
          class="w-full rounded-lg bg-slate-800 text-white py-2.5 text-sm font-medium hover:bg-slate-700 transition">
          Send recovery link
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-600">
        Remembered your password?
        <a href="#" class="text-slate-800 font-medium hover:underline">Back to login</a>
      </div>
    </div>
  </div>
</template>
