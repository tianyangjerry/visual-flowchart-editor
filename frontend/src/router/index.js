import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Editor from '../pages/Editor.vue'
import MyCenter from '../pages/Templates.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/editor',
      name: 'editor',
      component: Editor,
    },
    {
      path: '/my-center',
      name: 'my-center',
      component: MyCenter,
    },
  ],
})

export default router
