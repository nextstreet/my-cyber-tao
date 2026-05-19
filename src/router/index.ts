import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/cast',
      name: 'cast',
      component: () => import('../views/CastView.vue'),
    },
    {
      path: '/result/:id',
      name: 'result',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/destiny/:id',
      name: 'destiny',
      component: () => import('../views/DestinyView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
