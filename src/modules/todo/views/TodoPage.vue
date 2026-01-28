<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../store/todo.store'
import { TodoService } from '../services/todo.service'
import { TodoCategory, TodoStatus, WeekDays, type WeekDayIndex } from '../domain/todo.entity.ts'
import { useAuthStore } from '@/modules/auth/stores/auth.store.ts'

//
const days = Object.keys(WeekDays)
const currentDay = new Date().getDay()

//
const todoStore = useTodoStore()
const authUser = useAuthStore()
//
const openDay = ref<number>(currentDay)
const newTaskText = ref('')

//
const toggleDay = (indx: number) => {
  openDay.value = openDay.value === indx ? -1 : indx
}

const handleAddTodo = async function (dayIndex: WeekDayIndex) {
  if (!newTaskText.value.trim()) return

  if (!authUser.isAuthenticated || !authUser.user) return

  try {
    await TodoService.createTodo({
      text: newTaskText.value.trim(),
      status: TodoStatus.Waiting,
      category: TodoCategory.Today,
      dayOfWeek: dayIndex,
      userId: authUser.user.uid,
    })
  } catch (e) {}
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-4 md:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Mi Semana</h1>
      <p class="text-sm text-gray-500">Haz clic en un día para ver las tareas</p>
    </header>

    <section class="space-y-2">
      <div
        v-for="(day, index) in days"
        :key="day"
        class="border rounded-lg bg-white overflow-hidden"
      >
        <!--  -->
        <button
          @click="toggleDay(index)"
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
          :class="{ 'bg-blue-50/50': index === currentDay }"
        >
          <div class="flex items-center gap-3">
            <span :class="index === currentDay ? 'text-blue-600 font-bold' : 'text-gray-600'">
              {{ day }}
            </span>
            <span class="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {{ todoStore.getTodosByDay(index).length }}
            </span>
          </div>

          <div
            class="i-lucide-chevron-down transition-transform"
            :class="{ 'rotate-180 text-blue-600': openDay === index }"
          />
        </button>

        <div v-if="openDay === index" class="p-4 border-t bg-gray-50/30">
          <p class="text-xs text-gray-400 italic">Contenido de {{ day }} próximamente...</p>
        </div>

        <!--  -->
      </div>
    </section>
  </section>
</template>
