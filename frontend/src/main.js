import { createApp } from "vue";
import { createPinia } from "pinia";

import "./assets/variables.scss";
import "./assets/custom.css";
import "bootstrap/scss/bootstrap.scss";
import "bootstrap/dist/js/bootstrap.min.js";

import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount("#app");
