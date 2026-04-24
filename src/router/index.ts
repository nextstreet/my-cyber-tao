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
      // 命运卡片页：原始路由，保持与 DestinyView 一致
      path: '/destiny/:cardId',
      name: 'destiny',
      component: () => import('../views/DestinyView.vue'),
    },
  ],
})

export default router
