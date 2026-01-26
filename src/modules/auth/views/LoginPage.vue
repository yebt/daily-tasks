<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const mail = ref('')
const pass = ref('')
const loading = ref(false)

const handleLogin = async function () {
  try {
    loading.value = true
    await authStore.login(mail.value, pass.value)
    router.push('/')
  } catch (error) {
    console.error('Access Error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-slate-100 flex items-center justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-slate-800">Sign in</h1>
        <p class="text-sm text-slate-500 mt-1">Welcome back</p>
      </div>

      <form class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" placeholder="you@example.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" placeholder="••••••••"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800" />
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 text-slate-600">
            <input type="checkbox" class="rounded border-slate-300 text-slate-800 focus:ring-slate-800" />
            Remember me
          </label>
          <a href="#" class="text-slate-800 hover:underline">Forgot password?</a>
        </div>

        <button type="submit"
          class="w-full rounded-lg bg-slate-800 text-white py-2.5 text-sm font-medium hover:bg-slate-700 transition">
          Sign in
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?
        <a href="#" class="text-slate-800 font-medium hover:underline">Sign up</a>
      </div>
    </div>
  </section>
</template>
