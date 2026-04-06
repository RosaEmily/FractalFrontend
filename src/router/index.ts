import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/landing/HomeView.vue') },
  { path: '/programs', name: 'programs', component: () => import('@/views/landing/ProgramsView.vue') },
  { path: '/instructors', name: 'instructors', component: () => import('@/views/landing/InstructorsView.vue') },
  { path: '/contact', name: 'contact', component: () => import('@/views/landing/ContactView.vue') }
]

const router = createRouter({
  history: createWebHistory('/FractalFrontend/'), // base del repo
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
