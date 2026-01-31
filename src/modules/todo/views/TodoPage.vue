<script setup lang="ts">
import {  ref, watch } from 'vue'
import { useTodoStore } from '../store/todo.store'
import { TodoService } from '../services/todo.service'
import {
  TodoCategory,
  TodoStatus,
  WeekDays,
  type Todo,
  type WeekDayIndex,
} from '../domain/todo.entity.ts'
import { useAuthStore } from '@/modules/auth/stores/auth.store.ts'
import { useConfirmModal } from '@/shared/design-system/composables/useConfirmModal'
import ConfirmModal from '@/shared/design-system/components/ConfirmModal.vue'
import TodoHeader from '../components/TodoHeader.vue'
import TodoItem from '../components/TodoItem.vue'
import GenDailyModal from '@modules/daily/components/GenDailyModal.vue'
import DailyHistoryModal from '@modules/daily/components/DailyHistoryModal.vue'

//
const days = Object.values(WeekDays).filter((v) => typeof v === 'string') as string[]

const currentDay = new Date().getDay()

// const dateOfCurrentDay = computed(() => {
//   const today = new Date()
//   const diff = currentDay - today.getDay()
//   const targetDate = new Date(today)
//   targetDate.setDate(today.getDate() + diff)
//   return targetDate
// })

const getFormattedDateOfTheDay = (dayIndex: number) => {
  const today = new Date()
  const diff = dayIndex - today.getDay()
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + diff)
  return targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

//
const todoStore = useTodoStore()
const authUser = useAuthStore()
const confirmModal = useConfirmModal()
//
const openDay = ref<number>(currentDay)
const newTaskText = ref('')
const showAllDays = ref(false)
const isTransferring = ref(false)
const isGenDailyOpen = ref(false)
const isDailyHistoryOpen = ref(false)

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

const handleUpdateText = async (id: string, newText: string) => {
  await TodoService.updateTodo(id, { text: newText })
}

const handleUpdateCategory = async (id: string, newCategory: TodoCategory) => {
  // When transferring from Today to other categories, set status to Waiting
  if (newCategory !== TodoCategory.Today) {
    await TodoService.updateTodo(id, { category: newCategory, status: TodoStatus.Waiting })
  } else {
    await TodoService.updateTodo(id, { category: newCategory })
  }
}

const handleDeleteTodo = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    confirmText: 'Delete',
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
  <div class="pb-10">
    <TodoHeader
      title="My Week"
      :show-all-days-toggle="true"
      :all-days-enabled="showAllDays"
      :task-count="todoStore.todayTodos.length"
      @toggle-all-days="showAllDays = !showAllDays"
    >
      <template #extra-buttons>
        <button
          @click="isDailyHistoryOpen = true"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
          title="Daily history"
        >
          <em class="i-lucide-history w-4 h-4" />
          History
        </button>
        <button
          @click="isGenDailyOpen = true"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
          title="Generate daily with AI"
        >
          <em class="i-lucide-sparkles w-4 h-4" />
          Gen Daily
        </button>
      </template>
    </TodoHeader>
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
    <GenDailyModal
      :is-open="isGenDailyOpen"
      :open-day-index="openDay"
      @close="isGenDailyOpen = false"
    />
    <DailyHistoryModal :is-open="isDailyHistoryOpen" @close="isDailyHistoryOpen = false" />
    <div class="max-w-3xl mx-auto p-2 md:px-10">
      <div class="flex flex-col gap-1">
          <template v-for="(day, index) in days" :key="day">
            <section v-if="index === currentDay || showAllDays" class="transition-all duration-200">
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

                  <div class="text-xs text-gray-400 flex items-center gap-2">
                    <span>
                      {{ getFormattedDateOfTheDay(index) }}
                    </span>

                    <em
                      class="i-lucide-chevron-down w-4 h-4 transition-transform text-gray-400"
                      :class="{ 'rotate-180 text-blue-600': openDay === index }"
                    />
                  </div>
                </button>

              <div
                v-if="openDay === index"
                class="mt-2 mb-4 px-4 py-4 bg-white/50 rounded-b-lg space-y-4"
              >
                <div class="flex gap-2">
                  <input
                    v-model="newTaskText"
                    @keyup.enter="handleAddTodo(index)"
                    type="text"
                    placeholder="New task..."
                    class="flex-1 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                  />
                </div>

                <div class="space-y-1">
                    <TodoItem
                      v-for="todo in sortTodos(todoStore.getTodosByDay(index))"
                      :key="todo.id"
                      :todo="todo"
                      @update:status="(status) => handleUpdateStatus(todo.id!, status)"
                      @update:text="(text) => handleUpdateText(todo.id!, text)"
                      @update:category="(category) => handleUpdateCategory(todo.id!, category)"
                      @delete="handleDeleteTodo(todo.id!)"
                    />
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
                    {{ isTransferring ? 'Transferring...' : 'Move pending to tomorrow' }}
                  </button>
                </div>
              </div>
            </section>
          </template>
      </div>
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
  /* position: absolute; */
}
</style>
