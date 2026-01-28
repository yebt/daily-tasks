import { acceptHMRUpdate, defineStore } from 'pinia'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { computed } from 'vue'
import { TodoCategory, type Todo } from '../domain/todo.entity'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

export const useTodoStore = defineStore('todo', () => {
  const db = useFirestore()
  const authStore = useAuthStore()

  // 1. Referencia reactiva a la colección filtrada por el usuario actual
  // Usamos un query para no traer tareas de otros usuarios
  const todosQuery = computed(() => {
    if (!authStore.user?.uid) return null

    return query(
      collection(db, 'todos'),
      where('userId', '==', authStore.user.uid),
      orderBy('createdAt', 'desc'), // Para que las nuevas aparezcan arriba o abajo según prefieras
    )
  })

  // 2. Sincronización en tiempo real con VueFire
  // allTodos se actualizará solo cada vez que algo cambie en la DB
  const allTodos = useCollection<Todo>(todosQuery)

  // 3. Getters (Computed) para filtrar por categoría y días
  // Esto alimenta directamente a los acordeones en la vista
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
   * Helper para obtener las tareas de un día específico de la semana (0-6)
   * Se usa en el v-for de los acordeones en TodoPage.vue
   */
  // const getTodosByDay = (dayIndex: number) => {
  //   return todayTodos.value.filter((t) => t.dayOfWeek === dayIndex)
  // }

  const getTodosByDay = (dayIndex: number) => {
    return todayTodos.value.filter((t) => t.dayOfWeek === dayIndex)
  }

  return {
    allTodos,
    todayTodos,
    nextTodos,
    someDayTodos,
    getTodosByDay,
    // Exponemos el auth para que el componente pueda acceder fácilmente si lo necesita
    auth: authStore,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTodoStore, import.meta.hot))
}
