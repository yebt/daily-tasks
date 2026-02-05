import { acceptHMRUpdate, defineStore } from 'pinia'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { computed } from 'vue'
import { TodoCategory, type Todo } from '../domain/todo.entity'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

export const useTodoStore = defineStore('todo', () => {
  const db = useFirestore()
  const authStore = useAuthStore()

  // 1. Reactive reference to the collection filtered by the current user
  // We use a query to avoid fetching tasks from other users
  const todosQuery = computed(() => {
    if (!authStore.user?.uid) return null

    return query(
      collection(db, 'todos'),
      where('userId', '==', authStore.user.uid),
      orderBy('createdAt', 'desc'), // So new ones appear at the top or bottom as you prefer
    )
  })

  // 2. Real-time synchronization with VueFire
  // allTodos will update only when something changes in the DB
  // const allTodos = useCollection<Todo>(todosQuery)
  const allTodos = useCollection<Todo>(todosQuery, { ssrKey: 'todos-collection' })

  // 3. Getters (Computed) to filter by category and days
  // This feeds directly to the accordions in the view
  const todayTodos = computed(() =>
    allTodos.value.filter((t) => {
      return t.category === TodoCategory.Today
    }),
  )

  const nextTodos = computed(() => allTodos.value.filter((t) => t.category === TodoCategory.Next))

  const someDayTodos = computed(() =>
    allTodos.value.filter((t) => t.category === TodoCategory.SomeDay),
  )

  /**
   * Helper to get tasks from a specific day of the week (0-6)
   * Used in the v-for of the accordions in TodoPage.vue
   */
  // const getTodosByDay = (dayIndex: number) => {
  //   return todayTodos.value.filter((t) => t.dayOfWeek === dayIndex)
  // }

  const getTodosByDay = (dayIndex: number) => {
    const today = new Date()
    const firstWeekDay = today.getDate() - today.getDay() // First day is the day of the month - the day of the week
    const lastWeekDay = firstWeekDay + 6 // last day is the first day + 6

    return todayTodos.value.filter((t) => {
      return t.dayOfWeek === dayIndex
        && t.createdAt.toDate().getDate() >= firstWeekDay
        && t.createdAt.toDate().getDate() <= lastWeekDay
    })
  }

  return {
    allTodos,
    todayTodos,
    nextTodos,
    someDayTodos,
    getTodosByDay,
    // Expose auth so the component can easily access it if needed
    auth: authStore,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTodoStore, import.meta.hot))
}
