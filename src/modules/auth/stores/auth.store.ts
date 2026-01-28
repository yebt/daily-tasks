import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed } from 'vue'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

export const useAuthStore = defineStore('auth', () => {
  const auth = useFirebaseAuth()!

  const user = useCurrentUser()
  // const login = (email: string, passwrd: string) => signInWithEmailAndPassword(auth, email, passwrd)
  const login = async (email: string, passwrd: string, remember: boolean) => {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence
    await setPersistence(auth, persistence)
    return signInWithEmailAndPassword(auth, email, passwrd)
  }
  const logout = () => signOut(auth)
  const resetPassword = (mail: string) => sendPasswordResetEmail(auth, mail)

  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    isAuthenticated,
    login,
    logout,
    resetPassword,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
