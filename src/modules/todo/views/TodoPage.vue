<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../store/todo.store'
import { TodoService } from '../services/todo.service'
import {
  getTodoStatusIcon,
  TodoCategory,
  TodoStatus,
  TodoStatuses,
  WeekDays,
  type WeekDayIndex,
} from '../domain/todo.entity.ts'
import { useAuthStore } from '@/modules/auth/stores/auth.store.ts'

//
const days = Object.values(WeekDays).filter((v) => typeof v === 'string') as string[]
const statuses = TodoStatuses

const currentDay = new Date().getDay()

//
const todoStore = useTodoStore()
const authUser = useAuthStore()
//
const openDay = ref<number>(currentDay)
const newTaskText = ref('')

//
// ================================================================================

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
    newTaskText.value = ''
  } catch (e) {
    console.error('Error creating todo:', e)
  }
}

// const handleUpdateStatus = async (id: string, newStatus: TodoStatus) => {
const handleUpdateStatus = async (id: string, newStatus: string) => {
  const newTodoStatus = newStatus as TodoStatus
  await TodoService.updateTodo(id, { status: newTodoStatus })
}

const getStatusIcon = (statusValue: TodoStatus) => {
  return getTodoStatusIcon(statusValue)
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 md:p-10">
    <header class="mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Mi Semana</h1>
    </header>

    <div class="flex flex-col gap-1">
      <div v-for="(day, index) in days" :key="day" class="transition-all duration-200">
        <button @click="toggleDay(index)"
          class="w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all" :class="[
            openDay === index
              ? 'bg-white shadow-sm border border-gray-100 ring-1 ring-black/5 opacity-100'
              : 'opacity-50 hover:opacity-80 border-transparent bg-transparent shadow-none',
          ]">
          <div class="flex items-center gap-4">
            <span :class="[
              index === currentDay ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium',
              'text-sm',
            ]">
              {{ day }}
            </span>
            <span v-if="todoStore.getTodosByDay(index).length > 0"
              class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">
              {{ todoStore.getTodosByDay(index).length }}
            </span>
          </div>
          <div class="i-lucide-chevron-down w-4 h-4 transition-transform text-gray-400"
            :class="{ 'rotate-180 text-blue-500': openDay === index }" />
        </button>

        <div v-if="openDay === index" class="mt-2 mb-4 px-4 py-4 bg-white/50 rounded-b-lg space-y-4">
          <div class="flex gap-2">
            <input v-model="newTaskText" @keyup.enter="handleAddTodo(index)" type="text" placeholder="Nueva tarea..."
              class="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
          </div>

          <div class="space-y-1">
            <div v-for="todo in todoStore.getTodosByDay(index)" :key="todo.id"
              class="flex items-center gap-3 p-2 rounded-md hover:bg-white group transition-colors">
              <div class="relative w-5 h-5 flex items-center justify-center">
                <div :class="getStatusIcon(todo.status)" class="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                <select :value="todo.status" @change="
                  (e) => handleUpdateStatus(todo.id!, (e.target as HTMLSelectElement).value)
                " class="absolute inset-0 opacity-0 cursor-pointer">
                  <option v-for="s in statuses" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>

              <span class="text-sm flex-1" :class="{
                'line-through text-gray-400':
                  todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
              }">
                {{ todo.text }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
