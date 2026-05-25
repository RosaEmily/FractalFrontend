<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import LandingLayout from '../layouts/LandingLayout.vue'
import BannerSection from '../components/BannerSection.vue'
import KpisSection from '../components/KpisSection.vue'
import CoursesSection from '../components/CoursesSection.vue'
import RoutesSection from '../components/RoutesSection.vue'
import TeachersSection from '../components/TeachersSection.vue'
import PartnersSection from '../components/PartnersSection.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import FinalCtaSection from '../components/FinalCtaSection.vue'
import { useGeneralStore } from '@/modules/landing/stores/useGeneralStore'
import { useOfferStore } from '@/modules/landing/stores/useOfferStore'
import { useToastStore } from '@/shared/stores/useToastStore'
import { safeRequest } from '@/shared/utils/request'
import { teacherService } from '@/modules/landing/services/teacher.service'
import type { Teacher } from '@/modules/landing/models/teacher.model'

const generalStore = useGeneralStore()
const offerStore = useOfferStore()
const toastStore = useToastStore()

const teachers = ref<Teacher[]>([])
const teachersLoading = ref(false)

watch(() => generalStore.error, (err) => { if (err) toastStore.showToastError({ detail: err }) })
watch(() => offerStore.error,   (err) => { if (err) toastStore.showToastError({ detail: err }) })

const kpis    = computed(() => generalStore.data?.kpis    ?? [])
const partners = computed(() => generalStore.data?.partners ?? [])
const offers  = computed(() => offerStore.data?.offers    ?? [])

const reviews = [
  {
    name: 'Ana María López',
    career: 'Arquitecta',
    work: 'Cementos Pacasmayo',
    image: new URL('@/assets/review/reviewer1.jpg', import.meta.url).href,
    opinion: 'El diplomado en Modelado y Gestión BIM superó mis expectativas. Los instructores son expertos en la materia y el contenido muy relevante para la industria actual.',
    stars: 5,
    program: 'Modelado y Gestión BIM',
  },
  {
    name: 'Carlos Martínez',
    career: 'Ingeniero Civil',
    work: 'Gobierno Regional La Libertad',
    image: new URL('@/assets/review/reviewer2.jpg', import.meta.url).href,
    opinion: 'Gracias a la certificación en AutoCAD mejoré significativamente mis habilidades de diseño. Los cursos son prácticos y fáciles de seguir.',
    stars: 4.5,
    program: 'AutoCAD Civil 3D',
  },
  {
    name: 'Luca Fernández',
    career: 'Planificador Urbano',
    work: 'Ministerio de Vivienda',
    image: new URL('@/assets/review/reviewer3.jpg', import.meta.url).href,
    opinion: 'El diplomado me dio las herramientas para liderar proyectos complejos. La metodología de enseñanza es clara y efectiva.',
    stars: 5,
    program: 'Coordinación y Gestión BIM',
  },
]

async function fetchTeachers() {
  teachersLoading.value = true
  const { data, status } = await safeRequest(() => teacherService.get(), { showAlert: false })
  if (status) teachers.value = data?.teachers ?? []
  else toastStore.showToastError({ detail: 'No se pudo cargar los instructores.' })
  teachersLoading.value = false
}

onMounted(async () => {
  await Promise.all([
    generalStore.fetch(),
    fetchTeachers(),
    offerStore.fetch({
      offset: '0',
      limit: '4',
      order: 'enrollment_end_date:desc',
      filters: JSON.stringify({ type: { matchMode: 'equals', value: 'course' } }),
    }),
  ])
})
</script>

<template>
  <LandingLayout>
    <BannerSection />
    <KpisSection :kpis="kpis" :skeleton="generalStore.loading || !!generalStore.error" />
    <CoursesSection :offers="offers" :skeleton="offerStore.loading || !!offerStore.error" />
    <RoutesSection />
    <TeachersSection :teachers="teachers" :skeleton="teachersLoading" />
    <PartnersSection :partners="partners" :skeleton="generalStore.loading || !!generalStore.error" />
    <ReviewsSection :reviews="reviews" />
    <FinalCtaSection />
  </LandingLayout>
</template>
