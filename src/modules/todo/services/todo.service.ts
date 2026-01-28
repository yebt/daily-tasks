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
import { TodoStatus, type Todo } from '../domain/todo.entity'

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
}
