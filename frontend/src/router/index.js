import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    { path: '/about', component: () => import('../views/AboutView.vue') },

    { path: '/:pathMatch(.*)*', component: () => import('../views/Errors/404.vue') },
  ]
})

export default router
