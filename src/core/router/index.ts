import { authRoutes } from '@/modules/auth/infrastructure/router/auth.routes'
import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth.guard'
import { todoRoutes } from '@/modules/todo/infrastructure/routes/todo.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/todos',
      // component: () => import('@modules/todo/views/TodoPage.vue'),
    },

    // Imports
    ...authRoutes,
    ...todoRoutes,
  ],
})

// Guards
router.beforeEach(authGuard)

export default router
