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
import type { Todo } from '../domain/todo.entity'

const COL_NAME = 'todos'

export const TodoService = {
  /**
   * CREAR: Define la función que faltaba.
   * Recibe un objeto Partial o el Omit para no obligar a enviar el ID.
   */
  async createTodo(todo: Omit<Todo, 'id'>) {
    return addDoc(collection(db, COL_NAME), {
      ...todo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * ACTUALIZAR: Para cambiar el status, el texto o el día.
   */
  async updateTodo(id: string, updates: Partial<Todo>) {
    const todoRef = doc(db, COL_NAME, id)
    return updateDoc(todoRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  },

  /**
   * ELIMINAR: Borra físicamente el documento.
   */
  async deleteTodo(id: string) {
    const todoRef = doc(db, COL_NAME, id)
    return deleteDoc(todoRef)
  },

  /**
   * OPERACIÓN MASIVA: Transferir pendientes al día siguiente.
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

      // Solo transferimos lo que no ha sido finalizado o cancelado
      const isPending = data.status !== 'completed' && data.status !== 'cancel'

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
