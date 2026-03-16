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
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    // ★ 命运藏品专属页面
    {
      path: '/destiny/:cardId',
      name: 'destiny',
      component: () => import('../views/DestinyView.vue'),
      meta: { title: 'Cyber Tao · Destiny Card' },
    },
  ],
})

// 动态设置页面标题
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Cyber Tao'
})

export default router
