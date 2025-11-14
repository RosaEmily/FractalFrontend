<template>
  <Navbar class="sticky top-0 z-50"/>
  <main>
    <BannerSection :images="banner" :loading="loading"/>
    <KpisSection :kpis="kpis" :loading="loading"/>
    <CoursesSection :callouts="callouts" :visible-count="visibleCount" />
    <RoutesSection />
    <TeachersSection :teachers="teachers" />
    <PartnersSection :sponsors="sponsors" />
    <ReviewsSection :reviews="reviews" />
  </main>
  <Footer />
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import Navbar from '@/components/home/Navbar.vue'
  import BannerSection from '@/components/home/Banner.vue'
  import KpisSection from '@/components/home/Kpis.vue'
  import RoutesSection from '@/components/home/Routes.vue'
  import CoursesSection from '@/components/home/Courses.vue'
  import TeachersSection from '@/components/home/Teachers.vue'
  import PartnersSection from '@/components/home/Partners.vue'
  import ReviewsSection from '@/components/home/Reviews.vue'
  import Footer from '@/components/home/Footer.vue'
  
  import { AcademicCapIcon, BriefcaseIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/vue/24/outline'

  import { useLandingStore } from '@/stores/landing.store'

  const landingStore = useLandingStore()

  const loading = computed(() => landingStore.loading)

  const banner = computed(() => landingStore.data?.banner ?? [])

  const sponsors = [
    new URL('@/assets/sponsor/sponsor1.png', import.meta.url).href,
    new URL('@/assets/sponsor/sponsor2.png', import.meta.url).href,
    new URL('@/assets/sponsor/sponsor3.png', import.meta.url).href,
    new URL('@/assets/sponsor/sponsor4.png', import.meta.url).href,
    new URL('@/assets/sponsor/sponsor5.png', import.meta.url).href,
  ];

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

  const kpis = computed(() => {
    if (!landingStore.data?.kpis) return []

    const icons = [AcademicCapIcon, BriefcaseIcon, GlobeAltIcon, SparklesIcon]

    return landingStore.data.kpis.map((item, index) => ({
      ...item,
      icon: icons[index] ?? null
    }))
  })
  
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
    await landingStore.fetchLanding()
    console.log('Landing store después de fetch:', landingStore.data)
    console.log('loading:', loading.value)
    console.log('banner:', banner.value)
    console.log('kpis:', kpis.value)
  })
</script>