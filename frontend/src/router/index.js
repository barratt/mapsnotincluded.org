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
    { path: '/map-explorer', component: () => import('../views/MapExplorerStepsView.vue') },
    // { path: '/map-explorer', component: () => import('../views/MapExplorerView.vue') },
    { path: '/trait-finder', component: () => import('../views/WorldTraitFinderView.vue') },

    { path: '/about', component: () => import('../views/AboutView.vue') },
    { path: '/contribute', component: () => import('../views/ContributeView.vue') },

    { path: '/:pathMatch(.*)*', component: () => import('../views/Errors/404.vue') },
  ]
})

export default router
