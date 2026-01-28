<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTodoStore } from '../store/todo.store'
import { TodoService } from '../services/todo.service'
import {
  getTodoStatusIcon,
  TodoCategory,
  TodoStatus,
  TodoStatuses,
  WeekDays,
  type Todo,
  type WeekDayIndex,
} from '../domain/todo.entity.ts'
import { useAuthStore } from '@/modules/auth/stores/auth.store.ts'
import { useConfirmModal } from '@/shared/design-system/composables/useConfirmModal'
import ConfirmModal from '@/shared/design-system/components/ConfirmModal.vue'

//
const days = Object.values(WeekDays).filter((v) => typeof v === 'string') as string[]
const statuses = TodoStatuses

const currentDay = new Date().getDay()

//
const todoStore = useTodoStore()
const authUser = useAuthStore()
const confirmModal = useConfirmModal()
//
const openDay = ref<number>(currentDay)
const newTaskText = ref('')
const showAllDays = ref(false)
const isTransferring = ref(false)

//
// ================================================================================

const sortTodos = (todos: Todo[]) => {
  const priority: Record<string, number> = {
    [TodoStatus.Inprogress]: 1,
    [TodoStatus.Waiting]: 2,
    [TodoStatus.Appointment]: 3,
    [TodoStatus.Delegated]: 4,
    [TodoStatus.Completed]: 5,
    [TodoStatus.Cancel]: 6,
  }
  return [...todos].sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99))
}

const getStatusIcon = (statusValue: TodoStatus) => {
  return getTodoStatusIcon(statusValue)
}

const toggleDay = (indx: number) => {
  openDay.value = openDay.value === indx ? -1 : indx
}

const handleAddTodo = async function (dayIndex: WeekDayIndex) {
  if (!newTaskText.value.trim()) return

  if (!authUser.isAuthenticated || !authUser.user) return

  try {
    // await TodoService.createTodo({
    TodoService.createTodo({
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

const handleDeleteTodo = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Eliminar tarea',
    message: '¿Estás seguro de que quieres eliminar esta tarea?',
    confirmText: 'Eliminar',
    isDangerous: true,
  })

  if (confirmed) {
    try {
      await TodoService.deleteTodo(id)
    } catch (e) {
      console.error('Error deleting todo:', e)
    }
  }
}

const handleTransfer = async (dayIndex: number) => {
  if (!authUser.user?.uid) return

  isTransferring.value = true
  try {
    const moved = await TodoService.transferPendingTasksWB(authUser.user.uid, dayIndex)
    if (moved > 0) {
      openDay.value = (dayIndex + 1) % 7
    }
  } catch (e) {
    console.error('Error transferring tasks:', e)
  } finally {
    isTransferring.value = false
  }
}
// ================================================================================
watch(
  () => showAllDays.value,
  (newVal) => {
    if (!newVal) {
      openDay.value = currentDay
    }
  },
)
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 md:p-10">
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :is-dangerous="confirmModal.isDangerous"
      @confirm="confirmModal.handleConfirm()"
      @cancel="confirmModal.handleCancel()"
    />
    <header class="mb-10 flex items-center justify-between">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Mi Semana</h1>

      <button
        @click="showAllDays = !showAllDays"
        class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all"
        :class="
          showAllDays
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        "
      >
        <em :class="showAllDays ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-4 h-4" />
        {{ showAllDays ? 'Mostrando semana' : 'Solo hoy' }}
      </button>
    </header>

    <div class="flex flex-col gap-1">
      <TransitionGroup name="list">
        <template v-for="(day, index) in days" :key="day">
          <section v-if="index === currentDay || showAllDays" class="transition-all duration-200">
            <Transition name="list">
              <button
                @click="toggleDay(index)"
                v-if="showAllDays"
                class="w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all"
                :class="[
                  openDay === index
                    ? 'bg-white shadow-sm border border-gray-100 ring-1 ring-black/5 opacity-100'
                    : 'opacity-50 hover:opacity-80 border-transparent bg-transparent shadow-none',
                ]"
              >
                <div class="flex items-center gap-4">
                  <span
                    :class="[
                      index === currentDay
                        ? 'text-blue-600 font-bold'
                        : 'text-gray-700 font-medium',
                      'text-sm',
                    ]"
                  >
                    {{ day }}
                  </span>
                  <span
                    v-if="todoStore.getTodosByDay(index).length > 0"
                    class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold"
                  >
                    {{ todoStore.getTodosByDay(index).length }}
                  </span>
                </div>
                <em
                  class="i-lucide-chevron-down w-4 h-4 transition-transform text-gray-400"
                  :class="{ 'rotate-180 text-blue-600': openDay === index }"
                />
              </button>
            </Transition>

            <div
              v-if="openDay === index"
              class="mt-2 mb-4 px-4 py-4 bg-white/50 rounded-b-lg space-y-4"
            >
              <div class="flex gap-2">
                <input
                  v-model="newTaskText"
                  @keyup.enter="handleAddTodo(index)"
                  type="text"
                  placeholder="Nueva tarea..."
                  class="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>

              <div class="space-y-1">
                <TransitionGroup name="vt-fade">
                  <div
                    v-for="todo in sortTodos(todoStore.getTodosByDay(index))"
                    :key="todo.id"
                    class="flex items-center gap-3 p-2 rounded-md hover:bg-white group transition-colors"
                    :class="{ 'bg-emerald-50/30': todo.status === TodoStatus.Completed }"
                  >
                    <div class="relative w-5 h-5 flex items-center justify-center">
                      <em
                        :class="[
                          getStatusIcon(todo.status),
                          todo.status === TodoStatus.Completed
                            ? 'text-emerald-500'
                            : 'text-gray-400',
                        ]"
                        class="w-4 h-4 group-hover:text-blue-500"
                      />
                      <select
                        :value="todo.status"
                        @change="
                          (e) => handleUpdateStatus(todo.id!, (e.target as HTMLSelectElement).value)
                        "
                        class="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        <option v-for="s in statuses" :key="s.value" :value="s.value">
                          {{ s.label }}
                        </option>
                      </select>
                    </div>

                    <span
                      class="text-sm flex-1"
                      :class="{
                        'line-through text-slate-400 font-normal':
                          todo.status === TodoStatus.Cancel || todo.status === TodoStatus.Completed,
                        'text-emerald-700/70': todo.status === TodoStatus.Completed,
                      }"
                    >
                      {{ todo.text }}
                    </span>
                    <button
                      @click="handleDeleteTodo(todo.id!)"
                      class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Eliminar tarea"
                    >
                      <em class="i-lucide-trash-2 w-4 h-4" />
                    </button>
                  </div>
                </TransitionGroup>
              </div>

              <div
                v-if="todoStore.getTodosByDay(index).length > 0 && showAllDays"
                class="mt-6 pt-4 border-t border-gray-100 flex justify-end"
              >
                <button
                  @click="handleTransfer(index)"
                  :disabled="isTransferring"
                  class="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                >
                  <em
                    :class="
                      isTransferring
                        ? 'i-lucide-loader-2 animate-spin'
                        : 'i-lucide-arrow-right-to-line'
                    "
                    class="w-4 h-4"
                  />
                  {{ isTransferring ? 'Transfiriendo...' : 'Pasar pendientes a mañana' }}
                </button>
              </div>
            </div>
          </section>
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/*  */
.list-move,
/* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  /* transform: translateX(30px); */
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
