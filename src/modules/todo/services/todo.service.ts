import { firebaseDb as db } from '@/shared/infrastructure/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { TodoCategory, TodoStatus, type Todo } from '../domain/todo.entity'

const COL_NAME = 'todos'

export const TodoService = {
  /**
   * CREATE: Define the missing function.
   * Receives a Partial object or Omit to avoid forcing to send the ID.
   */
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) {
    return addDoc(collection(db, COL_NAME), {
      ...todo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * UPDATE: To change the status, text, or day.
   */
  async updateTodo(id: string, updates: Partial<Todo>) {
    const todoRef = doc(db, COL_NAME, id)
    return updateDoc(todoRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * DELETE: Physically deletes the document.
   */
  async deleteTodo(id: string) {
    const todoRef = doc(db, COL_NAME, id)
    return deleteDoc(todoRef)
  },

  /**
   * BULK OPERATION: Transfer pending tasks to the next day.
   * @deprecated The method should not be used
   */
  async transferPendingTasks(userId: string, fromDay: number) {
    const batch = writeBatch(db)
    const nextDay = (fromDay + 1) % 7

    const q = query(
      collection(db, COL_NAME),
      where('userId', '==', userId),
      where('dayOfWeek', '==', fromDay),
      where('category', '==', 'Today'),
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) return

    let tasksMoved = 0

    snapshot.docs.forEach((document) => {
      const data = document.data() as Todo

      // We only transfer what has not been completed or canceled
      // const isPending = data.status !== 'completed' && data.status !== 'cancel'
      const isPending = data.status !== TodoStatus.Completed && data.status !== TodoStatus.Cancel

      if (isPending) {
        batch.update(document.ref, {
          dayOfWeek: nextDay,
          updatedAt: serverTimestamp(),
        })
        tasksMoved++
      }
    })

    if (tasksMoved > 0) {
      return batch.commit()
    }
  },

  async transferPendingTasksWB(userId: string, fromDayIndex: number) {
    const batch = writeBatch(db)
    const nextDayIndex = (fromDayIndex + 1) % 7 // Ciclo de 0 a 6

    // Consultamos las tareas de ese día específico que pertenecen al usuario
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      where('dayOfWeek', '==', fromDayIndex),
      where('category', '==', TodoCategory.Today),
    )

    const snapshot = await getDocs(q)
    let count = 0

    snapshot.docs.forEach((document) => {
      const data = document.data()
      // Solo transferimos si NO está completada ni cancelada
      if (data.status !== TodoStatus.Completed && data.status !== TodoStatus.Cancel) {
        batch.update(document.ref, {
          dayOfWeek: nextDayIndex,
          updatedAt: serverTimestamp(),
        })
        count++
      }
    })

    if (count > 0) {
      await batch.commit()
    }
    return count
  },
}
