import type { RouteRecordRaw } from 'vue-router'

export const todoRoutes: RouteRecordRaw[] = [
  {
    path: '/todos',
    name: 'todos',
    component: () => import('@modules/todo/views/TodoPage.vue'),
    meta: { requiresAuth: true },
  },
]
