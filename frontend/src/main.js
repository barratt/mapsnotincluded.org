import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/variables.scss'
import './assets/custom.css'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/js/bootstrap.min.js'

import 'bootstrap-icons/font/bootstrap-icons.css'

import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n';
import messages from './content/index';

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages,
});

createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .mount('#app')