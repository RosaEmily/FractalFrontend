<script setup lang="ts">
import LandingButton from './ui/LandingButton.vue'
import LandingEyebrow from './ui/LandingEyebrow.vue'

const socialLinks = [
  { name: 'facebook',  href: 'https://www.facebook.com/fractalstudio.arq/' },
  { name: 'instagram', href: 'https://www.instagram.com/fractalstudio.pe/' },
  { name: 'linkedin',  href: 'https://www.linkedin.com/company/fractal-studio-arq/' },
  { name: 'youtube',   href: '#' },
]

const footerCols = [
  {
    title: 'Contacto',
    items: [
      { icon: 'mail',     label: 'contacto@proyectofractal.com', href: 'mailto:contacto@proyectofractal.com' },
      { icon: 'phone',    label: '+51 987 654 321',              href: 'tel:+51987654321' },
      { icon: 'pin',      label: 'Av. Ejemplo 123, Lima — Perú', href: '#' },
      { icon: 'whatsapp', label: 'WhatsApp · Atención 24/7',     href: '#' },
    ],
  },
  {
    title: 'Información',
    items: [
      { label: 'Preguntas frecuentes', href: '/contact' },
      { label: 'Comunidad de egresados', href: '#' },
      { label: 'Cursos corporativos',    href: '#' },
      { label: 'Becas y financiamiento', href: '#' },
    ],
  },
  {
    title: 'Compañía',
    items: [
      { label: 'Política de privacidad',  href: '#' },
      { label: 'Términos y condiciones',  href: '#' },
      { label: 'Libro de reclamaciones',  href: 'https://www.proyectofractal.com/libro-reclamaciones', external: true },
    ],
  },
]
</script>

<template>
  <footer class="bg-surface-cream">
    <!-- Newsletter CTA flotante -->
    <div class="mx-6 md:mx-16 translate-y-14 relative z-10">
      <div class="bg-surface-paper border border-line rounded-xl shadow-lg px-8 md:px-14 py-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center overflow-hidden relative">
        <!-- Decoración -->
        <div class="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-accent-soft opacity-60 pointer-events-none" />
        <div class="absolute -right-25 -bottom-20 w-44 h-44 rounded-full bg-accent-tint opacity-50 pointer-events-none" />

        <div class="relative z-10">
          <LandingEyebrow>NEWSLETTER · FRACTAL INSIGHT</LandingEyebrow>
          <h3 class="font-display text-[clamp(26px,3vw,36px)] font-bold leading-[1.05] tracking-tight mt-3 mb-2 text-secondary-900">
            Recibe nuevos programas y becas en tu correo.
          </h3>
          <p class="font-body text-[0.9375rem] text-secondary-500">
            Una vez al mes. Sin spam. Sólo lo nuevo de BIM, AutoCAD y construcción digital.
          </p>
        </div>

        <form @submit.prevent class="relative z-10 flex gap-2 items-center bg-surface-page rounded-full p-1.5 border border-line">
          <input
            type="email"
            placeholder="tu@correo.com"
            class="flex-1 px-4 py-3 font-body text-[0.9375rem] bg-transparent border-none outline-none text-secondary-900 placeholder:text-secondary-400"
          />
          <LandingButton size="md" type="submit">Suscribirme</LandingButton>
        </form>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="pt-32 pb-10 px-6 md:px-16 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12">
      <!-- Branding -->
      <div>
        <img src="@/assets/fractal.png" alt="Fractal Studio" class="h-10 w-auto" />
        <p class="font-body text-[0.875rem] leading-relaxed text-secondary-500 mt-6 mb-6 max-w-xs">
          Centro Autodesk Authorized Training Center en Perú. Formación técnica especializada en BIM, AutoCAD y herramientas digitales para arquitectura, ingeniería y construcción.
        </p>
        <p class="font-mono text-[0.625rem] text-secondary-400 tracking-widest uppercase mb-3">Síguenos</p>
        <div class="flex gap-2">
          <a v-for="s in socialLinks" :key="s.name" :href="s.href" target="_blank"
            class="w-9 h-9 rounded-full bg-surface-paper border border-line text-secondary-900 inline-flex items-center justify-center hover:-translate-y-0.5 transition-transform duration-200">
            <!-- Facebook -->
            <svg v-if="s.name === 'facebook'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2H15C13 2 11 4 11 6V9H8V13H11V22H15V13H18L19 9H15V7C15 6.5 15.5 6 16 6H18V2Z"/>
            </svg>
            <!-- Instagram -->
            <svg v-else-if="s.name === 'instagram'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7V7.5"/>
            </svg>
            <!-- LinkedIn -->
            <svg v-else-if="s.name === 'linkedin'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="3"/>
              <path d="M7 10V17M7 7V7.5M11 17V13C11 12 12 11 13 11S15 12 15 13V17M11 11V17" stroke-width="1.5"/>
            </svg>
            <!-- YouTube -->
            <svg v-else-if="s.name === 'youtube'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="13" rx="3"/>
              <path d="M10 9L15 12.5L10 16Z" :fill="'currentColor'"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Columnas -->
      <div v-for="col in footerCols" :key="col.title">
        <p class="font-mono text-[0.625rem] text-secondary-400 tracking-widest uppercase mb-4">{{ col.title }}</p>
        <ul class="flex flex-col gap-2.5">
          <li v-for="item in col.items" :key="item.label">
            <a :href="item.href" :target="item.external ? '_blank' : '_self'"
              class="font-body text-[0.844rem] text-secondary-900 inline-flex items-center gap-2 hover:opacity-60 transition-opacity">
              <!-- icon -->
              <svg v-if="item.icon === 'mail'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7L12 13L22 7"/></svg>
              <svg v-else-if="item.icon === 'phone'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4L7 4L9 9L7 11C8 14 10 16 13 17L15 15L20 17L20 21C20 21 19 21 18 21C10 21 3 14 3 6C3 5 3 4 3 4Z"/></svg>
              <svg v-else-if="item.icon === 'pin'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22S20 14 20 9A8 8 0 1 0 4 9C4 14 12 22 12 22Z"/><circle cx="12" cy="9" r="3"/></svg>
              <svg v-else-if="item.icon === 'whatsapp'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z"/></svg>
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright -->
    <div class="mx-6 md:mx-16 py-5 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[0.6875rem] text-secondary-400 tracking-[0.04em]">
      <span>© {{ new Date().getFullYear() }} FRACTAL STUDIO S.A.C. · TODOS LOS DERECHOS RESERVADOS</span>
      <span class="flex items-center gap-4">
        <span>HECHO EN LIMA · PERÚ</span>
        <span class="text-primary-500 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
          OPERATIVO
        </span>
      </span>
    </div>
  </footer>
</template>
