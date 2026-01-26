import { authRoutes } from '@/modules/auth/infrastructure/router/auth.routes'
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@modules/todo/views/TodoPage.vue'),
    },

    // Imports
    ...authRoutes
  ],
})

router.beforeEach(async (to) => {
  // NOTE: check if auth is required
  if (to.meta.requiresAuth) {
    const user = await getCurrentUser()

    if (!user) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  }

  // NOTE: redirect login to home
  if (to.name === 'login') {
    const user = await getCurrentUser()
    if (user) return { name: 'home' }
  }
})

export default router
