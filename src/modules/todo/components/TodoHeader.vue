<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface Props {
  title: string
  showAllDaysToggle?: boolean
  allDaysEnabled?: boolean
  taskCount?: number
}

interface Emits {
  'toggle-all-days': []
  'open-settings': []
}

withDefaults(defineProps<Props>(), {
  showAllDaysToggle: false,
  allDaysEnabled: false,
  taskCount: 0,
})

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()

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

const handleOpenSettings = () => {
  emit('open-settings')
}
</script>

<template>
  <div class="border-b border-gray-200 bg-white sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-6 py-6">
      <!-- Title and Controls Row -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ title }}</h1>

        <div class="flex items-center gap-3">
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

          <button
            @click="handleOpenSettings"
            class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title="Settings"
          >
            <em class="i-lucide-settings w-4 h-4" />
          </button>
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
</style>
