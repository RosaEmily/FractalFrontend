<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Drawer from "primevue/drawer";
import LandingButton from "./ui/LandingButton.vue";
import { hasSession } from "@/shared/utils/session";
import {
  syncClassroomUser,
  useClassroomRole,
} from "@/modules/classroom/composables/useClassroomRole";
import { CLASSROOM_ROLE_HOME } from "@/modules/classroom/constants/menu";

const route = useRoute();
const mobileOpen = ref(false);

/**
 * ⚠️ La landing es la primera pantalla que se monta, ANTES de que el aula
 * exista: el `ref` compartido de `useClassroomRole` se siembra al cargar SU
 * módulo, que en la landing puede quedar desactualizado si la cookie cambió
 * después (volver atrás, cerrar sesión en otra pestaña). Por eso se relee al
 * montar, igual que hace el guard tras recuperar una sesión.
 *
 * ⚠️ El PANEL usaría "app_user_admin" y `hasSession("admin")` — la landing es
 * pública para ambos, pero "Mi aula" solo tiene sentido para quien entra como
 * alumno o docente, así que se mira específicamente la zona `classroom`.
 */
onMounted(syncClassroomUser);

const isLoggedIn = computed(() => hasSession("classroom"));
const { firstName, initials, activeRole } = useClassroomRole();

/**
 * A qué pantalla del aula entra "Mi aula".
 *
 * ⚠️ NO es `{ name: "classroom-home" }` a secas: esa ruta es la home del
 * ALUMNO (`roles: ["STUDENT"]"), y el guard la protege por rol. Un docente que
 * hiciera clic ahí no entraría al aula — el guard le vería `hasAccess: false`,
 * le BORRARÍA la sesión (`clearSession`) y lo mandaría al login, con las
 * credenciales correctas y todo. Se resuelve la home real del rol activo, el
 * mismo cálculo que hace el guard para un login sin `redirect`.
 */
const classroomHomeRoute = computed(
  () => CLASSROOM_ROLE_HOME[activeRole.value ?? ""] ?? "classroom-home",
);

const navItems = [
  { key: "home", label: "Inicio", to: "/" },
  { key: "programs", label: "Programas", to: "/programs" },
  { key: "instructors", label: "Instructores", to: "/instructors" },
  { key: "contact", label: "Contacto", to: "/contact" },
];

function isActive(to: string) {
  return to === "/" ? route.path === "/" : route.path.startsWith(to);
}
</script>

<template>
  <!-- Top trust strip -->
  <div
    class="bg-surface-cream border-b border-line px-6 md:px-16 py-2.5 hidden md:flex justify-between items-center font-mono text-[0.6875rem] tracking-[0.06em] text-secondary-900"
  >
    <span class="flex items-center gap-2.5">
      <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
      AUTODESK AUTHORIZED TRAINING CENTER · PERÚ
    </span>
    <span class="flex gap-6 opacity-70">
      <a
        href="tel:+51987654321"
        class="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M3 4L7 4L9 9L7 11C8 14 10 16 13 17L15 15L20 17L20 21C20 21 19 21 18 21C10 21 3 14 3 6C3 5 3 4 3 4Z"
          />
        </svg>
        +51 987 654 321
      </a>
      <a
        href="mailto:contacto@proyectofractal.com"
        class="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7L12 13L22 7" />
        </svg>
        contacto@proyectofractal.com
      </a>
    </span>
  </div>

  <!-- Main nav -->
  <header
    class="sticky top-0 z-50 bg-surface-page/85 backdrop-blur-md border-b border-line px-6 md:px-16 py-4 flex justify-between items-center"
  >
    <!-- Logo -->
    <RouterLink to="/" class="flex items-center shrink-0">
      <img
        src="@/assets/fractal.png"
        alt="Fractal Studio"
        class="h-10 w-auto"
      />
    </RouterLink>

    <!-- Desktop nav -->
    <nav class="hidden md:flex gap-8 font-body text-[0.9375rem] font-medium">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        :class="[
          'relative pb-1 transition-colors duration-150 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-current after:transition-all after:duration-300',
          isActive(item.to)
            ? 'text-primary-500 after:right-0'
            : 'text-secondary-900 hover:text-primary-500 after:right-full hover:after:right-0',
        ]"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Desktop CTA -->
    <div class="hidden md:flex items-center gap-3">
      <template v-if="isLoggedIn">
        <!--
          Con sesión de aula: "Mi aula" + chip de avatar y nombre
          (v4/header-footer.jsx:63-65), en vez de "Iniciar sesión" y
          "Postular ahora" — ya está matriculado o dictando, no hay nada que
          postular.
        -->
        <RouterLink
          :to="{ name: classroomHomeRoute }"
          class="font-body text-[0.875rem] font-medium text-secondary-900 hover:opacity-70 transition-opacity"
        >
          Mi aula
        </RouterLink>
        <!--
          El chip de avatar es un atajo al PERFIL, no un segundo link al home:
          el diseño (v4/header-footer.jsx:64) los manda a los dos al mismo
          sitio porque es un mockup de una sola pantalla, pero en la app real
          "hacer clic en tu nombre" es el gesto esperado para ver tu cuenta —
          "Mi aula" ya cubre entrar al aula.
        -->
        <RouterLink
          :to="{ name: 'classroom-account' }"
          class="flex items-center gap-2.5 rounded-full border border-line bg-surface-paper py-1.5 pl-1.5 pr-3.5 hover:opacity-80 transition-opacity"
        >
          <span
            class="flex size-7 items-center justify-center rounded-full bg-primary-500 font-display text-[0.8125rem] font-bold text-white"
          >
            {{ initials }}
          </span>
          <span class="font-body text-[0.84375rem] font-semibold text-secondary-900">
            {{ firstName }}
          </span>
        </RouterLink>
      </template>
      <template v-else>
        <!--
          Al AULA, no al panel: quien entra desde la web pública es alumno o
          docente. `/login` es la puerta del backoffice, y mandarlos ahí los
          dejaba fuera con sus credenciales correctas.
        -->
        <RouterLink
          :to="{ name: 'classroom-login' }"
          class="font-body text-[0.875rem] font-medium text-secondary-900 hover:opacity-70 transition-opacity"
        >
          Iniciar sesión
        </RouterLink>
        <RouterLink to="/programs">
          <LandingButton size="sm">Postular ahora</LandingButton>
        </RouterLink>
      </template>
    </div>

    <!-- Mobile hamburger -->
    <button
      class="md:hidden p-2 text-secondary-900"
      @click="mobileOpen = true"
      aria-label="Abrir menú"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <path d="M3 6H21M3 12H21M3 18H14" />
      </svg>
    </button>
  </header>

  <!-- Mobile drawer (PrimeVue) -->
  <Drawer
    v-model:visible="mobileOpen"
    position="left"
    class="w-72! bg-surface-page!"
  >
    <template #header>
      <img src="@/assets/fractal.png" alt="Fractal Studio" class="h-9 w-auto" />
    </template>

    <nav class="flex flex-col gap-1 mt-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        @click="mobileOpen = false"
        :class="[
          'px-3 py-2.5 rounded-xl font-body text-[0.9375rem] font-medium transition-colors',
          isActive(item.to)
            ? 'text-primary-500 bg-accent-soft'
            : 'text-secondary-900 hover:bg-surface-cream',
        ]"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="mt-6 pt-6 border-t border-line flex flex-col gap-3">
      <template v-if="isLoggedIn">
        <RouterLink
          :to="{ name: classroomHomeRoute }"
          class="px-3 py-2.5 font-body text-[0.9375rem] font-medium text-secondary-900 hover:bg-surface-cream rounded-xl transition-colors"
          @click="mobileOpen = false"
        >
          Mi aula
        </RouterLink>
        <!--
          Segundo enlace, aparte de "Mi aula": es el mismo atajo al perfil
          que el chip del desktop, no un adorno con el nombre repetido.
        -->
        <RouterLink
          :to="{ name: 'classroom-account' }"
          class="flex items-center gap-2.5 px-3 py-2.5 font-body text-[0.9375rem] font-medium text-secondary-900 hover:bg-surface-cream rounded-xl transition-colors"
          @click="mobileOpen = false"
        >
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-500 font-display text-[0.8125rem] font-bold text-white"
          >
            {{ initials }}
          </span>
          {{ firstName }}
        </RouterLink>
      </template>
      <template v-else>
        <RouterLink
          :to="{ name: 'classroom-login' }"
          class="px-3 py-2.5 font-body text-[0.9375rem] font-medium text-secondary-900 hover:bg-surface-cream rounded-xl transition-colors"
          @click="mobileOpen = false"
        >
          Iniciar sesión
        </RouterLink>
        <RouterLink to="/programs" @click="mobileOpen = false">
          <LandingButton size="md" class="w-full justify-center"
            >Postular ahora</LandingButton
          >
        </RouterLink>
      </template>
    </div>
  </Drawer>
</template>
