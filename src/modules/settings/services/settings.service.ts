import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import type { Settings } from '../domain/settings.entity'

export class SettingsService {
  private static db = getFirestore()
  private static collectionName = 'settings'

  static async getSettings(userId: string): Promise<Settings | null> {
    try {
      const q = query(collection(this.db, this.collectionName), where('userId', '==', userId))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]

      return {
        id: doc?.id,
        ...doc?.data(),
      } as Settings
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  static async saveSettings(userId: string, settings: Partial<Settings>): Promise<void> {
    try {
      const q = query(collection(this.db, this.collectionName), where('userId', '==', userId))
      const snapshot = await getDocs(q)

      const timestamp = Date.now()

      if (snapshot.empty) {
        // Create new settings
        const newDoc = doc(collection(this.db, this.collectionName))
        await setDoc(newDoc, {
          userId,
          ...settings,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      } else {
        // Update existing settings
        const docId = snapshot.docs[0]?.id
        if (!docId) throw new Error('Document ID not found')

        await updateDoc(doc(this.db, this.collectionName, docId), {
          ...settings,
          updatedAt: timestamp,
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  }

  static async updateGeminiApiKey(userId: string, apiKey: string): Promise<void> {
    await this.saveSettings(userId, { geminiApiKey: apiKey })
  }

  static async updateDailyTemplate(userId: string, template: string): Promise<void> {
    await this.saveSettings(userId, { dailyTemplate: template })
  }
}
