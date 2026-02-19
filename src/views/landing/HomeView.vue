<template>
  <LandingLayout>
    <BannerSection :images="banner" :skeleton="loading || !!error"/>
    <KpisSection :kpis="kpis" :skeleton="loading || !!error"/>
    <CoursesSection :callouts="callouts"/>
    <RoutesSection />
    <TeachersSection :teachers="teachers" />
    <PartnersSection :partners="partners" :skeleton="loading || !!error"/>
    <ReviewsSection :reviews="reviews" />
  </LandingLayout>
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import LandingLayout from '@/layouts/LandingLayout.vue'
  import BannerSection from '@/components/landing/Banner.vue'
  import KpisSection from '@/components/landing/Kpis.vue'
  import RoutesSection from '@/components/landing/Routes.vue'
  import CoursesSection from '@/components/landing/Courses.vue'
  import TeachersSection from '@/components/landing/Teachers.vue'
  import PartnersSection from '@/components/landing/Partners.vue'
  import ReviewsSection from '@/components/landing/Reviews.vue'
  import { useLandingGeneralStore } from '@/stores/landing/general.store'

  const landingGeneralStore = useLandingGeneralStore()

  const loading = computed(() => landingGeneralStore.loading)
  const error = computed(() => landingGeneralStore.error)

  const banner = computed(() => landingGeneralStore.data?.banner ?? [])

  const partners = computed(() => landingGeneralStore.data?.partners ?? [])

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
  
  const teachers = [
    {
      name: 'Owen Rodriguez Lopez',
      title: 'Arquitectura | Especialista BIM',
      bio: 'Con experiencia en proyectos complejos y docencia profesional. Instructor certificado por Autodesk, experto en Revit y coordinación interdisciplinaria.',
      image: new URL('@/assets/teacher/prof1.png', import.meta.url).href,
      linkedinUrl: 'https://www.linkedin.com/in/owen-snayder-rodriguez-lopez-305655365/',
      otherUrl: 'https://www.behance.net/owenrodriguez',
      cvUrl: 'https://example.com/cv/owen-rodriguez-lopez.pdf',
      phrase: 'Transformación Digital en AEC',
    },
    {
      name: 'Maité Avalos Soplopuco',
      title: 'Arquitectura | Planificadora Urbana',
      bio: 'Expande el conocimiento en modelado estructural.',
      image: new URL('@/assets/teacher/prof2.png', import.meta.url).href,
      linkedinUrl: 'https://www.linkedin.com/in/maite-avalos/',
      otherUrl: 'https://www.camila-torres-portfolio.com',
      cvUrl: 'https://example.com/cv/camila-torres.pdf',
      phrase: 'Urbanismo Sostenible',
    },
    {
      name: 'Jonathan Picon Torres',
      title: 'Ing. Civil | BIM Manager',
      bio: 'Formador certificado por Autodesk, ha liderado numerosos proyectos y capacitaciones especializadas. Destaca por su enfoque innovador y compromiso con la excelencia.',
      image: new URL('@/assets/teacher/prof3.png', import.meta.url).href,
      linkedinUrl: 'https://www.linkedin.com/in/jonathan-arley-picon-torres-2b5a92143/',
      otherUrl: 'https://www.youtube.com/@jpbimRevit',
      cvUrl: 'https://example.com/cv/mariana-perez.pdf',
      phrase: 'Gestión de la Construcción',
    },
    {
      name: 'Nixon Delgado Toro',
      title: 'Ing Civil | Especialista Estructural',
      bio: 'Modelador BIM con experiencia en análisis sísmico, geotecnia y cimentaciones. Comprometido con la innovación, la eficiencia y la calidad en proyectos de edificación.',
      image: new URL('@/assets/teacher/prof4.png', import.meta.url).href,
      linkedinUrl: 'https://www.linkedin.com/in/nixon-gary-delgado-toro-10133320b/',
      otherUrl: 'https://www.luis-ramirez-design.com',
      cvUrl: 'https://example.com/cv/luis-ramirez.pdf',
      phrase: 'Innovación en Infraestructura',
    },
    {
      name: 'Juan Carlos Santamaria',
      title: 'Arquitectura | Especialista BIM',
      bio: 'Centrado en la gestión y coordinación de proyectos bajo estándares BIM. Con habilidades de liderazgo, gestión de equipo de trabajo y destrezas tecnológicas.',
      image: new URL('@/assets/teacher/prof5.png', import.meta.url).href,
      linkedinUrl: 'https://www.linkedin.com/in/juancarlos-snt/',
      otherUrl: 'https://www.carlos-gomez-management.com',
      cvUrl: 'https://example.com/cv/carlos-gomez.pdf',
      phrase: 'Programación Dynamo BIM',
    },
  ]

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
    //console.log('st_loading:', loading.value)
    //console.log('st_error:', !!error.value)
    //console.log('st_skeleton:', loading.value || !!error.value)
    //console.log('obj_error:', error.value)
    //console.log('obj_banner:', banner.value)
    //console.log('obj_kpis:', kpis.value)
    //console.log('obj_partners:', partners.value)
  })
</script>