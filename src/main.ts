import 'virtual:uno.css'
import '@/core/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './shared/infrastructure/firebase'

import App from './App.vue'
import router from '@/core/router'
import { loadSentry } from './core/services/sentry'

const app = createApp(App)
const pinia = createPinia()

// load if is in production
if (import.meta.env.PROD) loadSentry(app, router, pinia)

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.use(pinia)
app.use(router)

app.mount('#app')
