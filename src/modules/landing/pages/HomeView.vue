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
import { testimonialService } from '@/modules/landing/services/testimonial.service'
import { offerService } from '@/modules/landing/services/offer.service'
import type { Teacher } from '@/modules/landing/models/teacher.model'
import type { Testimonial } from '@/modules/landing/models/testimonial.model'
import type { Offer } from '@/modules/landing/models/offer.model'

const generalStore = useGeneralStore()
const offerStore = useOfferStore()
const toastStore = useToastStore()

const teachers = ref<Teacher[]>([])
const teachersLoading = ref(false)

/**
 * Testimonios curados (`is_featured=1`) desde `landing/testimonials`.
 * Reemplaza el array hardcodeado de 3 reviews fijas (Ana María López / Carlos
 * Martínez / Luca Fernández, commit 46e5139). Puede venir vacío o con menos de
 * 3: `ReviewsSection.vue` ya reparte en grid, no asume una cantidad fija.
 */
const reviews = ref<Testimonial[]>([])

/**
 * Programas de tipo línea de carrera a la venta (v4: la sección "Líneas de
 * carrera" pinta ofertas, no los `learning_paths` sueltos). Puede venir vacío:
 * la sección se oculta sola.
 */
const pathOffers = ref<Offer[]>([])
const pathOffersLoading = ref(false)

watch(() => generalStore.error, (err) => { if (err) toastStore.showToastError({ detail: err }) })
watch(() => offerStore.error,   (err) => { if (err) toastStore.showToastError({ detail: err }) })

const banner  = computed(() => generalStore.data?.banner  ?? [])
const kpis    = computed(() => generalStore.data?.kpis    ?? [])
const partners = computed(() => generalStore.data?.partners ?? [])
const offers  = computed(() => offerStore.data?.offers    ?? [])

async function fetchTeachers() {
  teachersLoading.value = true
  const { data, status } = await safeRequest(() => teacherService.get(), { showAlert: false })
  if (status) teachers.value = data?.teachers ?? []
  else toastStore.showToastError({ detail: 'No se pudo cargar los instructores.' })
  teachersLoading.value = false
}

async function fetchReviews() {
  const { data, status } = await safeRequest(() => testimonialService.get(), { showAlert: false })
  if (status) reviews.value = data ?? []
  // Sin alerta si falla: la sección se oculta sola con 0 reviews (ver template).
}

async function fetchPathOffers() {
  pathOffersLoading.value = true
  const { data, status } = await safeRequest(
    () => offerService.list({ types: ['learning_path'], limit: '8', order: 'enrollment_end_date:desc' }),
    { showAlert: false },
  )
  if (status) pathOffers.value = data?.offers ?? []
  // Sin alerta si falla: la sección se oculta sola con 0 líneas de carrera.
  pathOffersLoading.value = false
}

onMounted(async () => {
  await Promise.all([
    generalStore.ensure(),
    fetchTeachers(),
    fetchReviews(),
    fetchPathOffers(),
    /*
     * Sin filtro de `type`: la sección tiene tabs Todos/Cursos/Diplomados que
     * filtran EN EL FRONTEND sobre este mismo array (`CoursesSection.vue`).
     * Filtrar aquí por `type: 'course'` dejaba la sección siempre vacía en
     * cualquier tab el día que la única oferta activa fuera un diplomado —
     * el pedido nunca llegaba a pedir `learning_path`.
     */
    offerStore.fetch({
      offset: '0',
      limit: '8',
      order: 'enrollment_end_date:desc',
    }),
  ])
})
</script>

<template>
  <LandingLayout>
    <BannerSection :banner="banner" :skeleton="generalStore.loading || !!generalStore.error" />
    <KpisSection :kpis="kpis" :skeleton="generalStore.loading || !!generalStore.error" />
    <CoursesSection :offers="offers" :skeleton="offerStore.loading || !!offerStore.error" />
    <RoutesSection :offers="pathOffers" :skeleton="pathOffersLoading" />
    <TeachersSection :teachers="teachers" :skeleton="teachersLoading" />
    <PartnersSection :partners="partners" :skeleton="generalStore.loading || !!generalStore.error" />
    <ReviewsSection v-if="reviews.length" :reviews="reviews" />
    <FinalCtaSection />
  </LandingLayout>
</template>
