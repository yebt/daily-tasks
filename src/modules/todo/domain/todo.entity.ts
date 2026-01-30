import type { Timestamp } from "firebase/firestore"

// export type TodoStatus = 'waiting' | 'in-progress' | 'completed' | 'delegated' | 'appointment' | 'cancel' | string
export enum TodoStatus {
  Waiting = 'WAITING',
  Inprogress = 'IN-PROGRESS',
  Completed = 'COMPLETED',
  Delegated = 'DELEGATED',
  Appointment = 'APPOINTMENT',
  Cancel = 'CANCEL',
}

export const TodoStatusIcon: Record<TodoStatus, string> = {
  // [TodoStatus.Waiting]: 'i-lucide:clock',
  [TodoStatus.Waiting]: 'i-lucide:circle-dashed',
  // [TodoStatus.Inprogress]: 'i-lucide:play',
  [TodoStatus.Inprogress]: 'i-lucide:coffee',
  [TodoStatus.Completed]: 'i-lucide:circle-check-big',
  [TodoStatus.Delegated]: 'i-lucide:circle-arrow-out-down-right',
  // [TodoStatus.Appointment]: 'i-lucide-calendar',
  // [TodoStatus.Appointment]: 'i-lucide:target',
  [TodoStatus.Appointment]: 'i-lucide:calendar',
  // [TodoStatus.Cancel]: 'i-lucide-x-circle',
  [TodoStatus.Cancel]: 'i-lucide:circle-slash-2',
}

export const TodoStatusLabel: Record<TodoStatus, string> = {
  [TodoStatus.Waiting]: 'Waiting',
  [TodoStatus.Inprogress]: 'In Progress',
  [TodoStatus.Completed]: 'Completed',
  [TodoStatus.Delegated]: 'Delegated',
  [TodoStatus.Appointment]: 'Appointment',
  [TodoStatus.Cancel]: 'Canceled',
}

export const TodoStatuses = Object.values(TodoStatus).map((status) => ({
  value: status,
  label: TodoStatusLabel[status],
  icon: TodoStatusIcon[status],
}))

export const getTodoStatusIcon = (status: TodoStatus) => {
  return TodoStatusIcon[status]
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
  // dayOfWeek?: number // 0-6 (Sunday-Saturday) for "Today" accordions
   dayOfWeek?: WeekDayIndex // 0-6 (Sunday-Saturday) for "Today" accordions
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
