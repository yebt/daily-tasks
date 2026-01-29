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

loadSentry(app, router, pinia)

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.use(pinia)
app.use(router)

app.mount('#app')
