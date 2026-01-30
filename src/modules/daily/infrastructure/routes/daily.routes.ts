import type { RouteRecordRaw } from 'vue-router'

export const dailyRoutes: RouteRecordRaw[] = [
  {
    path: '/daily/:id',
    name: 'daily-view',
    component: () => import('@modules/daily/views/DailyPage.vue'),
    meta: { requiresAuth: true },
  },
]
