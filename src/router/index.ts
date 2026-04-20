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
      path: '/result/:sessionId',
      name: 'result',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/destiny',
      name: 'destiny',
      component: () => import('../views/DestinyView.vue'),
    },
  ],
})

export default router
