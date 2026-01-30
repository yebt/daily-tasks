import { DEFAULT_DAILY_TEMPLATE } from '@modules/daily/domain/daily.entity'

export interface Settings {
  id?: string
  userId: string
  geminiApiKey: string
  dailyTemplate: string
  createdAt: number
  updatedAt: number
}

export interface SettingsForm {
  geminiApiKey: string
  dailyTemplate: string
}

export const getDefaultSettings = (): Omit<Settings, 'id' | 'userId'> => ({
  geminiApiKey: '',
  dailyTemplate: DEFAULT_DAILY_TEMPLATE,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})
