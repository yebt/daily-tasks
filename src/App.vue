<script setup lang="ts">
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'

const getTransitionName = (route: RouteLocationNormalizedLoadedGeneric): string => {
  const meta = route.meta as Record<string, string>
  return meta.transition || 'crossfade'
}
</script>
<template>
  <main class="antialiased text-gray-900 router-container">
    <!-- <RouterView /> -->
    <RouterView v-slot="{ Component, route }">
      <Transition :name="getTransitionName(route)" >
        <div class="route-wrapper" :key="route.fullPath">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.router-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* Adjust as needed */
}

.route-wrapper {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.crossfade-enter-active,
.crossfade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.crossfade-enter-active {
  position: absolute;
  top: 0;
  left: 0;
}

.crossfade-enter-from,
.crossfade-leave-to {
  opacity: 0;
}
</style>
