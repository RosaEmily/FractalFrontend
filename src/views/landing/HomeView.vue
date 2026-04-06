<template>
  <LandingLayout>
    <BannerSection :images="banner" :skeleton="landingGeneralStore.loading || !!landingGeneralStore.error"/>
    <KpisSection :kpis="kpis" :skeleton="landingGeneralStore.loading || !!landingGeneralStore.error"/>
    <CoursesSection :callouts="callouts"/>
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
  import { useToast } from '@/composables/useToast'

  const landingGeneralStore = useLandingGeneralStore()
  const landingTeacherStore = useLandingTeacherStore()
  const { show: showToast } = useToast()

  watch(() => landingGeneralStore.error, (err) => {
    if (err) showToast(err.message)
  })

  watch(() => landingTeacherStore.error, (err) => {
    if (err) showToast(err.message)
  })

  const banner = computed(() => landingGeneralStore.data?.banner ?? [])

  const partners = computed(() => landingGeneralStore.data?.partners ?? [])

  const teachers = computed(() => landingTeacherStore.data?.teachers ?? [])

  const callouts = [
    {
      name: 'Modelado y Gestión BIM',
      description: 'Diplomado internacional en',
      tags: ['Revit structure', 'Revit Architecture', 'Revit MEP', 'Dynamo', 'Power BI', 'Autodesk Construction Cloud Introduction'],
      imageSrc: new URL('@/assets/route/ruta1.jpg', import.meta.url).href,
      imageAlt: 'Imagen representativa de Modelado y Gestión BIM',
      href: '#',
    },
    {
      name: 'Coordinación y Gestión BIM',
      description: 'Diplomado internacional en',
      tags: ['Autodesk Revit', 'Autodesk Construction Cloud', 'Navisworks Manage', 'Revizto', 'Trimble Connect', 'Dalux', 'Presto'],
      imageSrc: new URL('@/assets/route/ruta3.jpg', import.meta.url).href,
      imageAlt: 'Imagen representativa de Coordinación y Gestión BIM',
      href: '#',
    },
    {
      name: 'Diseño con AutoCAD',
      description: 'Certificación internacional en',
      tags: ['AutoCAD 2D', 'AutoCAD 3D'],
      imageSrc: new URL('@/assets/route/ruta2.jpg', import.meta.url).href,
      imageAlt: 'Imagen representativa de Diseño con AutoCAD',
      href: '#',
    },
    {
      name: 'Infraestructura Civil',
      description: 'Especialización en',
      tags: ['Civil 3D Autodesk',  'Recap Pro Autodesk', 'Infraworks Autodesk', 'BIM', '3ds Max'],
      imageSrc: new URL('@/assets/route/ruta4.png', import.meta.url).href,
      imageAlt: 'Imagen representativa de Infraestructura Civil',
      href: '#',
    }
  ]

  const kpis = computed(() => landingGeneralStore.data?.kpis ?? [])

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
    await landingGeneralStore.fetchLandingGeneral()
    console.log('Data fetchLandingGeneral:', landingGeneralStore.data)
    await landingTeacherStore.fetchLandingTeacher()
    console.log('Data fetchLandingTeacher:', landingTeacherStore.data)
    //console.log('st_loading:', loading.value)
    //console.log('st_error:', !!error.value)
    //console.log('st_skeleton:', loading.value || !!error.value)
    //console.log('obj_error:', error.value)
    //console.log('obj_banner:', banner.value)
    //console.log('obj_kpis:', kpis.value)
    //console.log('obj_partners:', partners.value)
  })
</script>