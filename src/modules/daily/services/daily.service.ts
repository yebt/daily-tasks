import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { firebaseDb } from '@shared/infrastructure/firebase'
import type { Daily } from '../domain/daily.entity'
import { DAILY_COLLECTION } from '../domain/daily.entity'

export class DailyService {
  static async createDaily(daily: Omit<Daily, 'id' | 'createdAt' | 'generatedAt'>): Promise<Daily> {
    const now = Date.now()
    const docRef = await addDoc(collection(firebaseDb, DAILY_COLLECTION), {
      ...daily,
      createdAt: now,
      generatedAt: now,
    })
    return {
      ...daily,
      id: docRef.id,
      createdAt: now,
      generatedAt: now,
    }
  }

  static async getDailysByUser(userId: string): Promise<Daily[]> {
    const q = query(
      collection(firebaseDb, DAILY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Daily,
    )
  }

  static async deleteDaily(id: string): Promise<void> {
    await deleteDoc(doc(firebaseDb, DAILY_COLLECTION, id))
  }

  static async deleteDailiesBatch(ids: string[]): Promise<void> {
    const batch = writeBatch(firebaseDb)
    ids.forEach((id) => {
      batch.delete(doc(firebaseDb, DAILY_COLLECTION, id))
    })
    await batch.commit()
  }
}
