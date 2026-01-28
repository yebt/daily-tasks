<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../store/todo.store'

const todoStore = useTodoStore()

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const currentDay = new Date().getDay()

const openDay = ref<number>(currentDay)

const toggleDay = (indx: number) => {
  openDay.value = openDay.value === indx ? -1 : indx
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-4 md:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Mi Semana</h1>
      <p class="text-sm text-gray-500">Haz clic en un día para ver las tareas</p>
    </header>

    <section class="space-y-2">
      <div v-for="(day, index) in days" :key="day" class="border rounded-lg bg-white overflow-hidden">

        <!--  -->
        <button @click="toggleDay(index)"
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
          :class="{ 'bg-blue-50/50': index === currentDay }">
          <div class="flex items-center gap-3">
            <span :class="index === currentDay ? 'text-blue-600 font-bold' : 'text-gray-600'">
              {{ day }}
            </span>
            <span class="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {{ todoStore.getTodosByDay(index).length }}
            </span>
          </div>

          <div class="i-lucide-chevron-down transition-transform"
            :class="{ 'rotate-180 text-blue-600': openDay === index }" />
        </button>

        <div v-if="openDay === index" class="p-4 border-t bg-gray-50/30">
          <p class="text-xs text-gray-400 italic">Contenido de {{ day }} próximamente...</p>
        </div>

        <!--  -->
      </div>
    </section>
  </section>
</template>
