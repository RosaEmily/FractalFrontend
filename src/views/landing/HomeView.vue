<template>
  <LandingLayout>
    <BannerSection :images="banner" :skeleton="landingGeneralStore.loading || !!landingGeneralStore.error"/>
    <KpisSection :kpis="kpis" :skeleton="landingGeneralStore.loading || !!landingGeneralStore.error"/>
    <CoursesSection :offers="offers" :skeleton="landingOfferStore.loading || !!landingOfferStore.error"/>
    <RoutesSection />
    <TeachersSection :teachers="teachers" :skeleton="landingTeacherStore.loading || !!landingTeacherStore.error" />
    <PartnersSection :partners="partners" :skeleton="landingGeneralStore.loading || !!landingGeneralStore.error"/>
    <ReviewsSection :reviews="reviews" />
  </LandingLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import LandingLayout from '@/layouts/LandingLayout.vue'
  import BannerSection from '@/components/landing/BannerSection.vue'
  import KpisSection from '@/components/landing/KpisSection.vue'
  import RoutesSection from '@/components/landing/RoutesSection.vue'
  import CoursesSection from '@/components/landing/CoursesSection.vue'
  import TeachersSection from '@/components/landing/TeachersSection.vue'
  import PartnersSection from '@/components/landing/PartnersSection.vue'
  import ReviewsSection from '@/components/landing/ReviewsSection.vue'
  import { useLandingGeneralStore } from '@/stores/landing/general.store'
  import { useLandingTeacherStore } from '@/stores/landing/teacher.store'
  import { useLandingOfferStore } from '@/stores/landing/offer.store'
  import { useToast } from '@/composables/useToast'

  const landingGeneralStore = useLandingGeneralStore()
  const landingTeacherStore = useLandingTeacherStore()
  const landingOfferStore = useLandingOfferStore()
  const { show: showToast } = useToast()

  watch(() => landingGeneralStore.error, (err) => {
    if (err) showToast(err.message)
  })

  watch(() => landingTeacherStore.error, (err) => {
    if (err) showToast(err.message)
  })

  watch(() => landingOfferStore.error, (err) => {
    if (err) showToast(err.message)
  })

  const banner = computed(() => landingGeneralStore.data?.banner ?? [])
  const partners = computed(() => landingGeneralStore.data?.partners ?? [])
  const kpis = computed(() => landingGeneralStore.data?.kpis ?? [])
  const teachers = computed(() => landingTeacherStore.data?.teachers ?? [])
  const offers = computed(() => landingOfferStore.data?.items ?? [])

  const reviews = [
    {
      name: 'Ana María López',
      career: 'Arquitecta',
      work: 'Cementos Pacasmayo',
      image: new URL('@/assets/review/reviewer1.jpg', import.meta.url).href,
      opinion: 'El diplomado en Modelado y Gestión BIM superó mis expectativas. Los instructores son expertos en la materia y el contenido es muy relevante para la industria actual. ¡Lo recomiendo totalmente!',
      stars: 5,
    },
    {
      name: 'Carlos Martínez',
      career: 'Ingeniero Civil',
      work: 'Gobierno Regional La Libertad',
      image: new URL('@/assets/review/reviewer2.jpg', import.meta.url).href,
      opinion: 'Gracias a la certificación en AutoCAD, he mejorado significativamente mis habilidades de diseño. Los cursos son prácticos y fáciles de seguir. ¡Una excelente inversión en mi carrera!',
      stars: 4.5,
    },
    {
      name: 'Luca Fernández',
      career: 'Planificador Urbano',
      work: 'Ministerio de Vivienda',
      image: new URL('@/assets/review/reviewer3.jpg', import.meta.url).href,
      opinion: 'El diplomado en Coordinación y Gestión BIM me ha proporcionado las herramientas necesarias para liderar proyectos complejos. La metodología de enseñanza es clara y efectiva.',
      stars: 5,
    },
  ]

  onMounted(async () => {
    await Promise.all([
      landingGeneralStore.fetchLandingGeneral(),
      landingTeacherStore.fetchLandingTeacher(),
      landingOfferStore.fetchLandingOffer()
    ])
    console.log('Data fetchLandingGeneral:', landingGeneralStore.data)
    console.log('Data fetchLandingTeacher:', landingTeacherStore.data)
    console.log('Data fetchLandingOffer:', landingOfferStore.data)
  })
</script>
