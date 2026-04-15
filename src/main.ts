import './assets/main.css'
import 'material-symbols/outlined.css'
import 'vue3-toastify/dist/index.css'
import './material'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right'
} as ToastContainerOptions)

app.mount('#app')
