import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyD8A3tVl73PSxMgRilHh2MXqDdoSfWnqoE",
  authDomain: "vue-wrkshps.firebaseapp.com",
  projectId: "vue-wrkshps",
  storageBucket: "vue-wrkshps.firebasestorage.app",
  messagingSenderId: "832372852884",
  appId: "1:832372852884:web:8d95c791abe4c979740c81",
  measurementId: "G-ZTG5Y2NL8R"
})

export const firebaseDb = getFirestore(firebaseApp)
export const firebaseAuth = getAuth(firebaseApp)
