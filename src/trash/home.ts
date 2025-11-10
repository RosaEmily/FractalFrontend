/*
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { Dialog, DialogPanel, PopoverGroup } from '@headlessui/vue'
  import { Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

  const mobileMenuOpen = ref(false)

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
      imageSrc: '/src/assets/rutas/ruta1.jpg',
      imageAlt: 'Imagen representativa de Modelado y Gestión BIM',
      href: '#',
    },
    {
      name: 'Coordinación y Gestión BIM',
      description: 'Diplomado internacional en',
      tags: ['Autodesk Revit', 'Autodesk Construction Cloud', 'Navisworks Manage', 'Revizto', 'Trimble Connect', 'Dalux', 'Presto'],
      imageSrc: '/src/assets/rutas/ruta3.jpg',
      imageAlt: 'Imagen representativa de Coordinación y Gestión BIM',
      href: '#',
    },
    {
      name: 'Diseño con AutoCAD',
      description: 'Certificación internacional en',
      tags: ['AutoCAD 2D', 'AutoCAD 3D'],
      imageSrc: '/src/assets/rutas/ruta2.jpg',
      imageAlt: 'Imagen representativa de Diseño con AutoCAD',
      href: '#',
    },
    {
      name: 'Infraestructura Civil',
      description: 'Especialización en',
      tags: ['Civil 3D Autodesk',  'Recap Pro Autodesk', 'Infraworks Autodesk', 'BIM', '3ds Max'],
      imageSrc: '/src/assets/rutas/ruta4.png',
      imageAlt: 'Imagen representativa de Infraestructura Civil',
      href: '#',
    }
  ]

  const current = ref(0);
  const next = () => current.value = (current.value + 1) % images.length;
  const prev = () => current.value = (current.value - 1 + images.length) % images.length;

  let interval = null

  onUnmounted(() => {
    clearInterval(interval)
  })

  const screenWidth = ref(window.innerWidth)

  onMounted(() => {
    interval = setInterval(next, 5000) // cambia cada 5 segundos

    window.addEventListener('resize', () => {
      screenWidth.value = window.innerWidth
    })
  })

  const visibleCount = computed(() => {
    if (screenWidth.value >= 1024) return 4 // lg
    return 2 // md>
  })
*/