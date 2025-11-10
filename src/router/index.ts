import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView }
]

const router = createRouter({
  history: createWebHistory('/FractalFrontend/'), // base del repo
  routes,
})

export default router
