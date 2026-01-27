import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getCurrentUser } from 'vuefire'

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const user = await getCurrentUser()

  const requiresAtuh = to.matched.some((record) => record.meta.requiresAtuh)
  const requiresNoAuth = to.matched.some((record) => record.meta.requiresNoAuth)

  if (requiresAtuh && !user) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }
  // if (to.name == 'login' && user) {
  //   next({ name: 'home' })
  //   return
  // }
  if (requiresNoAuth && user) {
    next({ name: 'home' })
    return
  }
  next()
}
