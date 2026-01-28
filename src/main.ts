import 'virtual:uno.css'
import '@/core/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './shared/infrastructure/firebase'

import App from './App.vue'
import router from '@/core/router'

const app = createApp(App)

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.use(createPinia())
app.use(router)

app.mount('#app')
