<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@modules/auth/stores/auth.store'

interface Props {
  title: string
  showAllDaysToggle?: boolean
  allDaysEnabled?: boolean
  taskCount?: number
}

interface Emits {
  'toggle-all-days': []
}

withDefaults(defineProps<Props>(), {
  showAllDaysToggle: false,
  allDaysEnabled: false,
  taskCount: 0,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showLogoutMenu = ref(false)

const tabs: Array<{ name: string; path: string; icon: string }> = [
  { name: 'Today', path: '/todos', icon: 'i-lucide:target' },
  { name: 'Next', path: '/next', icon: 'i-lucide:clock' },
  { name: 'Someday', path: '/someday', icon: 'i-lucide:lightbulb' },
]

const currentTab = computed<(typeof tabs)[0]>(() => {
  const found = tabs.find((tab) => tab.path === route.path)
  return (found ?? tabs[0])!
})

const navigateTo = (path: string) => {
  router.push(path)
}

const handleToggleAllDays = () => {
  emit('toggle-all-days')
}

const handleGoToSettings = (): void => {
  showLogoutMenu.value = false
  router.push({ name: 'settings' })
}

const handleLogout = async (): Promise<void> => {
  showLogoutMenu.value = false
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-6 py-6">
      <!-- Title and Controls Row -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight text-nowrap">{{ title }}</h1>

        <div class="flex items-center gap-3 flex-wrap justify-end ">
          <slot name="extra-buttons" />

          <transition name="fade">
            <span
              v-if="taskCount > 0"
              class="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full"
            >
              {{ taskCount }} {{ taskCount === 1 ? 'task' : 'tasks' }}
            </span>
          </transition>

          <button
            v-if="showAllDaysToggle"
            @click="handleToggleAllDays"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
              allDaysEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100',
            ]"
            title="Toggle between today and full week view"
          >
            <em :class="allDaysEnabled ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-4 h-4" />
            {{ allDaysEnabled ? 'Week view' : 'Today' }}
          </button>

          <!-- Logout Menu -->
          <div class="relative">
            <button
              @click="showLogoutMenu = !showLogoutMenu"
              class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              title="User menu"
            >
              <em class="i-lucide-user w-4 h-4" />
            </button>

            <transition name="dropdown">
              <div
                v-if="showLogoutMenu"
                class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email }}</p>
                </div>
                <button
                  @click="handleGoToSettings"
                  class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 border-b border-gray-100"
                >
                  <em class="i-lucide-settings w-4 h-4" />
                  Settings
                </button>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <em class="i-lucide-log-out w-4 h-4" />
                  Logout
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <nav class="flex items-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          @click="navigateTo(tab.path)"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all border',
            currentTab.path === tab.path
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
              : 'bg-white border-transparent text-gray-600 hover:bg-gray-50',
          ]"
        >
          <em :class="tab.icon" class="w-4 h-4" />
          {{ tab.name }}
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
