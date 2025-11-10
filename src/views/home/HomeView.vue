<template>
  <Navbar />
  <main>
    <BannerSection :images="images" />
    <KpisSection :kpis="kpis" />
    <RoutesSection :callouts="callouts" :visible-count="visibleCount" />
    <CoursesSection />
    <TeachersSection :teachers="teachers" />
    <PartnersSection :sponsors="sponsors" />
  </main>
</template>

<script setup>
  import Navbar from '@/components/home/Navbar.vue'
  import BannerSection from '@/components/home/Banner.vue'
  import KpisSection from '@/components/home/Kpis.vue'
  import RoutesSection from '@/components/home/Routes.vue'
  import CoursesSection from '@/components/home/Courses.vue'
  import TeachersSection from '@/components/home/Teachers.vue'
  import PartnersSection from '@/components/home/Partners.vue'
  
  import { AcademicCapIcon, BriefcaseIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/vue/24/outline'

  const images = [
    {
      desktop: '/src/assets/banner/banner1.png',
      mobile: '/src/assets/banner/banner1_mobile.png',
    },
    {
      desktop: '/src/assets/banner/banner2.png',
      mobile: '/src/assets/banner/banner2_mobile.png',
    },
    {
      desktop: '/src/assets/banner/banner3.png',
      mobile: '/src/assets/banner/banner3_mobile.png',
    },
  ];

  const sponsors = [
    '/src/assets/sponsor/sponsor1.png',
    '/src/assets/sponsor/sponsor2.png',
    '/src/assets/sponsor/sponsor3.png',
    '/src/assets/sponsor/sponsor4.png',
    '/src/assets/sponsor/sponsor5.png',
  ];

  const callouts = [
    {
      name: 'Modelado y Gestión BIM',
      description: 'Diplomado internacional en',
      tags: ['Revit structure', 'Revit Architecture', 'Revit MEP', 'Dynamo', 'Power BI', 'Autodesk Construction Cloud Introduction'],
      imageSrc: '/src/assets/route/ruta1.jpg',
      imageAlt: 'Imagen representativa de Modelado y Gestión BIM',
      href: '#',
    },
    {
      name: 'Coordinación y Gestión BIM',
      description: 'Diplomado internacional en',
      tags: ['Autodesk Revit', 'Autodesk Construction Cloud', 'Navisworks Manage', 'Revizto', 'Trimble Connect', 'Dalux', 'Presto'],
      imageSrc: '/src/assets/route/ruta3.jpg',
      imageAlt: 'Imagen representativa de Coordinación y Gestión BIM',
      href: '#',
    },
    {
      name: 'Diseño con AutoCAD',
      description: 'Certificación internacional en',
      tags: ['AutoCAD 2D', 'AutoCAD 3D'],
      imageSrc: '/src/assets/route/ruta2.jpg',
      imageAlt: 'Imagen representativa de Diseño con AutoCAD',
      href: '#',
    },
    {
      name: 'Infraestructura Civil',
      description: 'Especialización en',
      tags: ['Civil 3D Autodesk',  'Recap Pro Autodesk', 'Infraworks Autodesk', 'BIM', '3ds Max'],
      imageSrc: '/src/assets/route/ruta4.png',
      imageAlt: 'Imagen representativa de Infraestructura Civil',
      href: '#',
    }
  ]

  const kpis = [
    {
      icon: AcademicCapIcon,
      number: 95,
      format: '+{n}%',
      description: 'Tasa de satisfacción de alumnos participantes',
    },
    {
      icon: BriefcaseIcon,
      number: 80,
      format: '+{n}%',
      description: 'Tasa de mejora laboral tras unirse a un programa',
    },
    {
      icon: GlobeAltIcon,
      number: 6,
      format: '+{n}',
      description: 'Países con red de profesionales conectados',
    },
    {
      icon: SparklesIcon,
      number: 250,
      format: '+{n}',
      description: 'Certificaciones internacionales otorgadas',
    }
  ]
  
  const teachers = [
    {
      name: 'Owen Rodriguez Lopez',
      title: 'Arquitectura | Especialista BIM',
      bio: 'Con experiencia en proyectos complejos y docencia profesional. Instructor certificado por Autodesk, experto en Revit y coordinación interdisciplinaria.',
      image: '/src/assets/teacher/prof1.png',
      linkedinUrl: 'https://www.linkedin.com/in/owen-snayder-rodriguez-lopez-305655365/',
      otherUrl: 'https://www.behance.net/owenrodriguez',
      cvUrl: 'https://example.com/cv/owen-rodriguez-lopez.pdf',
      phrase: 'Transformación Digital en AEC',
    },
    {
      name: 'Maité Avalos Soplopuco',
      title: 'Arquitectura | Planificadora Urbana',
      bio: 'Expande el conocimiento en modelado estructural.',
      image: '/src/assets/teacher/prof2.png',
      linkedinUrl: 'https://www.linkedin.com/in/maite-avalos/',
      otherUrl: 'https://www.camila-torres-portfolio.com',
      cvUrl: 'https://example.com/cv/camila-torres.pdf',
      phrase: 'Urbanismo Sostenible',
    },
    {
      name: 'Jonathan Picon Torres',
      title: 'Ing. Civil | BIM Manager',
      bio: 'Formador certificado por Autodesk, ha liderado numerosos proyectos y capacitaciones especializadas. Destaca por su enfoque innovador y compromiso con la excelencia.',
      image: '/src/assets/teacher/prof3.png',
      linkedinUrl: 'https://www.linkedin.com/in/jonathan-arley-picon-torres-2b5a92143/',
      otherUrl: 'https://www.youtube.com/@jpbimRevit',
      cvUrl: 'https://example.com/cv/mariana-perez.pdf',
      phrase: 'Gestión de la Construcción',
    },
    {
      name: 'Nixon Delgado Toro',
      title: 'Ing Civil | Especialista Estructural',
      bio: 'Modelador BIM con experiencia en análisis sísmico, geotecnia y cimentaciones. Comprometido con la innovación, la eficiencia y la calidad en proyectos de edificación.',
      image: '/src/assets/teacher/prof4.png',
      linkedinUrl: 'https://www.linkedin.com/in/nixon-gary-delgado-toro-10133320b/',
      otherUrl: 'https://www.luis-ramirez-design.com',
      cvUrl: 'https://example.com/cv/luis-ramirez.pdf',
      phrase: 'Innovación en Infraestructura',
    },
    {
      name: 'Juan Carlos Santamaria',
      title: 'Arquitectura | Especialista BIM',
      bio: 'Centrado en la gestión y coordinación de proyectos bajo estándares BIM. Con habilidades de liderazgo, gestión de equipo de trabajo y destrezas tecnológicas.',
      image: '/src/assets/teacher/prof5.png',
      linkedinUrl: 'https://www.linkedin.com/in/juancarlos-snt/',
      otherUrl: 'https://www.carlos-gomez-management.com',
      cvUrl: 'https://example.com/cv/carlos-gomez.pdf',
      phrase: 'Programación Dynamo BIM',
    },
  ]
</script>