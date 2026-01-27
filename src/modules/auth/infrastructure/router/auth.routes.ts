import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@modules/auth/views/LoginPage.vue'),
    meta: { requiresNoAuth: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@modules/auth/views/ForgotPasswordPage.vue'),
    meta: { requiresNoAuth: true },
  },
]
