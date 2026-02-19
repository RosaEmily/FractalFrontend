import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/landing/HomeView.vue'
import ProgramsView from '@/views/landing/ProgramsView.vue'
import InstructorsView from '@/views/landing/InstructorsView.vue'
import ContactView from '@/views/landing/ContactView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/programs', name: 'programs', component: ProgramsView },
  { path: '/instructors', name: 'instructors', component: InstructorsView },
  { path: '/contact', name: 'contact', component: ContactView }
]

const router = createRouter({
  history: createWebHistory('/FractalFrontend/'), // base del repo
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
