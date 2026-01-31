import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
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

  const signup = async (email: string, passwrd: string, remember: boolean, username?: string) => {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence
    await setPersistence(auth, persistence)
    const userCredential = await createUserWithEmailAndPassword(auth, email, passwrd)
    if (username && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: username })
    }
    return userCredential
  }

  const logout = () => signOut(auth)
  const resetPassword = (mail: string) => sendPasswordResetEmail(auth, mail)

  const changePassword = async (newPassword: string): Promise<void> => {
    if (!user.value) throw new Error('No user logged in')
    return updatePassword(user.value, newPassword)
  }

  const updateUsername = async (newUsername: string): Promise<void> => {
    if (!user.value) throw new Error('No user logged in')
    return updateProfile(user.value, { displayName: newUsername })
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    changePassword,
    updateUsername,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
