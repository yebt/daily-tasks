import type { RouteRecordRaw } from 'vue-router'

export const todoRoutes: RouteRecordRaw[] = [
  {
    path: '/todos',
    name: 'todos',
    component: () => import('@modules/todo/views/TodoPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/next',
    name: 'next',
    component: () => import('@modules/todo/views/NextPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/someday',
    name: 'someday',
    component: () => import('@modules/todo/views/SomedayPage.vue'),
    meta: { requiresAuth: true },
  },
]
