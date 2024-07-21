import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/variables.scss'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/js/bootstrap.min.js'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
