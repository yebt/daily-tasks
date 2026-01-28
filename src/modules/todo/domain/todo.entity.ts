export type TodoStatus = 'waiting' | 'in-progress' | 'completed' | 'delegated' | 'appointment' | 'cancel' | string

export type TodoCategory = 'Today' | 'Next' | 'Some day'

export interface Todo {
  id?: string
  text: string
  status: TodoStatus
  category: TodoCategory
  dayOfWeek?: number // 0-6 (Domingo-Sábado) para los acordeones de "Today"
  userId: string
  createdAt: number
  updatedAt: number
}
