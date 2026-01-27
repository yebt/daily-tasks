import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getCurrentUser } from 'vuefire'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const requiresAtuh = to.matched.some((record) => record.meta.requiresAtuh)
  const user = await getCurrentUser()

  if (requiresAtuh && !user) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }
  if (to.name == 'login' && user) {
    next({ name: 'home' })
    return
  }
  next()
}
