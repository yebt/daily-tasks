import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
const requiresAtuh = to.matched.some( record => record.meta.requiresAtuh)
  const user = await :
}
