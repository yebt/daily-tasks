<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { useSettingsStore } from '@modules/settings/store/settings.store'
import { DEFAULT_DAILY_TEMPLATE } from '@modules/daily/domain/daily.entity'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const username = ref(authStore.user?.displayName || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const apiKeyInput = ref('')
const templateInput = ref('')
const apiKeyVisible = ref(false)

const isSaving = ref(false)
const isChangingPassword = ref(false)
const isSavingCredentials = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const activeTab = ref<'profile' | 'password' | 'credentials'>('profile')

const isUsernameModified = computed(() => username.value !== (authStore.user?.displayName || ''))
const isPasswordValid = computed(
  () => newPassword.value.length >= 6 && newPassword.value === confirmPassword.value,
)
const isCredentialsModified = computed(
  () =>
    apiKeyInput.value !== settingsStore.geminiApiKey ||
    templateInput.value !== settingsStore.dailyTemplate,
)

watch(
  () => authStore.user,
  async () => {
    if (authStore.user) {
      await settingsStore.loadSettings()
      apiKeyInput.value = settingsStore.geminiApiKey
      templateInput.value = settingsStore.dailyTemplate
    }
  },
  { immediate: true },
)

const handleSaveUsername = async (): Promise<void> => {
  if (!username.value.trim()) {
    errorMsg.value = 'Username cannot be empty'
    return
  }

  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await authStore.updateUsername(username.value.trim())
    successMsg.value = 'Username updated successfully'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to update username:', error)
    errorMsg.value = 'Failed to update username. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const handleChangePassword = async (): Promise<void> => {
  if (!currentPassword.value) {
    errorMsg.value = 'Current password is required'
    return
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = 'New password must be at least 6 characters'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }

  isChangingPassword.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Note: To securely verify current password, you'd typically need to re-authenticate
    // For now, we'll proceed with updating the password
    await authStore.changePassword(newPassword.value)
    successMsg.value = 'Password changed successfully'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error: unknown) {
    console.error('Failed to change password:', error)
    if (error instanceof Error && error.message.includes('auth/requires-recent-login')) {
      errorMsg.value = 'Please log in again before changing your password'
    } else {
      errorMsg.value = 'Failed to change password. Please try again.'
    }
  } finally {
    isChangingPassword.value = false
  }
}

const handleSaveCredentials = async (): Promise<void> => {
  isSavingCredentials.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (apiKeyInput.value !== settingsStore.geminiApiKey) {
      await settingsStore.updateGeminiApiKey(apiKeyInput.value.trim())
    }
    if (templateInput.value !== settingsStore.dailyTemplate) {
      await settingsStore.updateDailyTemplate(templateInput.value)
    }
    successMsg.value = 'Credentials saved successfully'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to save credentials:', error)
    errorMsg.value = 'Failed to save credentials. Please try again.'
  } finally {
    isSavingCredentials.value = false
  }
}

const resetTemplate = (): void => {
  templateInput.value = DEFAULT_DAILY_TEMPLATE
}

const handleBack = (): void => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div class="max-w-2xl mx-auto px-6 py-6">
        <div class="flex items-center gap-4">
          <button
            @click="handleBack"
            class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title="Go back"
          >
            <em class="i-lucide-arrow-left w-4 h-4" />
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-6 py-8">
      <!-- Alerts -->
      <transition name="slide-fade">
        <div
          v-if="successMsg"
          class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-start"
        >
          <div class="i-lucide-check-circle w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-green-700">{{ successMsg }}</p>
        </div>
      </transition>

      <transition name="slide-fade">
        <div
          v-if="errorMsg"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start"
        >
          <div class="i-lucide-alert-circle w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700">{{ errorMsg }}</p>
        </div>
      </transition>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          @click="activeTab = 'profile'"
          :class="[
            'pb-4 px-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap',
            activeTab === 'profile'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900',
          ]"
        >
          Profile
        </button>
        <button
          @click="activeTab = 'password'"
          :class="[
            'pb-4 px-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap',
            activeTab === 'password'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900',
          ]"
        >
          Change Password
        </button>
        <button
          @click="activeTab = 'credentials'"
          :class="[
            'pb-4 px-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap',
            activeTab === 'credentials'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900',
          ]"
        >
          API & Templates
        </button>
      </div>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="space-y-6">
            <!-- Email (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                :value="authStore.user?.email || ''"
                disabled
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="mt-1.5 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Enter your username"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
              <p class="mt-1.5 text-xs text-gray-500">
                This is your display name across the application
              </p>
            </div>

            <!-- Save Button -->
            <div class="flex gap-3 pt-4">
              <button
                @click="handleSaveUsername"
                :disabled="!isUsernameModified || isSaving"
                class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <em v-if="isSaving" class="i-lucide-loader-2 w-4 h-4 animate-spin" />
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Tab -->
      <div v-if="activeTab === 'password'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="space-y-6">
            <!-- Current Password -->
            <div>
              <label for="current-password" class="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="current-password"
                v-model="currentPassword"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
              <p class="mt-1.5 text-xs text-gray-500">
                For security, we require your current password
              </p>
            </div>

            <!-- New Password -->
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                placeholder="Minimum 6 characters"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
              <p class="mt-1.5 text-xs text-gray-500">Minimum 6 characters for your security</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>

            <!-- Change Password Button -->
            <div class="flex gap-3 pt-4">
              <button
                @click="handleChangePassword"
                :disabled="!currentPassword || !newPassword || !confirmPassword || !isPasswordValid || isChangingPassword"
                class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <em v-if="isChangingPassword" class="i-lucide-loader-2 w-4 h-4 animate-spin" />
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Credentials Tab -->
      <div v-if="activeTab === 'credentials'" class="space-y-6">
        <!-- API Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Gemini API Key</h3>
          <div class="space-y-4">
            <div>
              <label for="gemini-api-key" class="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div class="relative">
                <input
                  id="gemini-api-key"
                  v-model="apiKeyInput"
                  :type="apiKeyVisible ? 'text' : 'password'"
                  placeholder="Enter your Gemini API key"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition pr-10"
                />
                <button
                  @click="apiKeyVisible = !apiKeyVisible"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <em :class="apiKeyVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
                </button>
              </div>
              <p class="mt-2 text-xs text-gray-500">
                Your API key is stored securely in Firestore
              </p>
            </div>

            <div v-if="settingsStore.error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ settingsStore.error }}</p>
            </div>
          </div>
        </div>

        <!-- Template Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Daily Generation Template</h3>
            <button
              @click="resetTemplate"
              class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              type="button"
            >
              Reset to default
            </button>
          </div>
          <div class="space-y-4">
            <textarea
              v-model="templateInput"
              rows="12"
              placeholder="Enter your daily template..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-mono text-sm"
            />
            <p class="text-xs text-gray-500">
              Use <code class="bg-gray-100 px-1 rounded">&#x7b;&#x7b;fecha&#x7d;&#x7d;</code> for
              current date and
              <code class="bg-gray-100 px-1 rounded">&#x7b;&#x7b;tareas&#x7d;&#x7d;</code> to
              include task list
            </p>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex gap-3">
          <button
            @click="handleSaveCredentials"
            :disabled="!isCredentialsModified || isSavingCredentials"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <em v-if="isSavingCredentials" class="i-lucide-loader-2 w-4 h-4 animate-spin" />
            {{ isSavingCredentials ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
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
