import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@modules/auth/views/LoginPage.vue'),
    meta: { requiresNoAuth: true },
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('@modules/auth/views/SignUpPage.vue'),
    meta: { requiresNoAuth: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@modules/auth/views/ForgotPasswordPage.vue'),
    meta: { requiresNoAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@modules/auth/views/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },
]
