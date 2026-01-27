import { authRoutes } from '@/modules/auth/infrastructure/router/auth.routes'
import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@modules/todo/views/TodoPage.vue'),
    },

    // Imports
    ...authRoutes,
  ],
})

// Guards
router.beforeEach(authGuard)

export default router
