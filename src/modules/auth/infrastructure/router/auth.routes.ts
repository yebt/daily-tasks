import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@modules/auth/views/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@modules/auth/views/ForgotPassword.vue'),
    meta: { requiresAuth: false },
  },
]
