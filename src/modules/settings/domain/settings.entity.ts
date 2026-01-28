export interface Settings {
  id?: string
  userId: string
  geminiApiKey: string
  createdAt: number
  updatedAt: number
}

export interface SettingsForm {
  geminiApiKey: string
}
