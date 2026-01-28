// export type TodoStatus = 'waiting' | 'in-progress' | 'completed' | 'delegated' | 'appointment' | 'cancel' | string
export enum TodoStatus {
  Waiting = 'WAITING',
  Inprogress = 'IN-PROGRESS',
  Completed = 'COMPLETED',
  Delegated = 'DELEGATED',
  Appointment = 'APPOINTMENT',
  Cancel = 'CANCEL',
}

// export type TodoCategory = 'Today' | 'Next' | 'Some day'
export enum TodoCategory {
  Today = 'TODAY',
  Next = 'NEXT',
  SomeDay = 'SOME DAY',
}

export enum WeekDays {
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
}

export type WeekDayIndex = WeekDays

export interface Todo {
  id?: string
  text: string
  status: TodoStatus
  category: TodoCategory
  // dayOfWeek?: number // 0-6 (Domingo-Sábado) para los acordeones de "Today"
  dayOfWeek?: WeekDayIndex // 0-6 (Domingo-Sábado) para los acordeones de "Today
  userId: string
  createdAt: number
  updatedAt: number
}
