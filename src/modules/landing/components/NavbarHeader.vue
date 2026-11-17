<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Drawer from "primevue/drawer";
import LandingButton from "./ui/LandingButton.vue";
import { useSiteContact } from "../composables/useSiteContact";
import { hasSession } from "@/shared/utils/session";
import {
  syncClassroomUser,
  useClassroomRole,
} from "@/modules/classroom/composables/useClassroomRole";
import { CLASSROOM_ROLE_HOME } from "@/modules/classroom/constants/menu";

const route = useRoute();
const { phone, email, telHref, mailHref, whatsappHref } = useSiteContact();

/** "Contacto rápido" del menú móvil: WhatsApp y correo, si el panel los tiene. */
const quickContacts = computed(() => {
  const wa = whatsappHref();
  return [
    wa && phone.value ? { icon: "whatsapp", label: "WhatsApp", value: phone.value, href: wa, external: true } : null,
    email.value && mailHref.value ? { icon: "mail", label: "Email", value: email.value, href: mailHref.value, external: false } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
});
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
    class="bg-surface-cream border-b border-line px-6 md:px-8 lg:px-16 py-2.5 hidden md:flex whitespace-nowrap justify-between items-center font-mono text-[0.6875rem] tracking-[0.06em] text-secondary-900"
  >
    <span class="flex items-center gap-2.5">
      <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
      AUTODESK AUTHORIZED TRAINING CENTER · PERÚ
    </span>
    <span class="flex gap-6 opacity-70">
      <a
        v-if="phone && telHref"
        :href="telHref"
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
        {{ phone }}
      </a>
      <a
        v-if="email && mailHref"
        :href="mailHref"
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
        {{ email }}
      </a>
    </span>
  </div>

  <!-- Main nav -->
  <header
    class="bg-surface-page/85 backdrop-blur-md border-b border-line px-6 md:px-8 lg:px-16 py-4 flex justify-between items-center"
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
    <nav class="hidden md:flex gap-5 lg:gap-8 font-body text-[0.9375rem] font-medium">
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
    <div class="hidden md:flex items-center gap-2 lg:gap-3">
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
      class="md:hidden grid size-10 place-items-center rounded-full border border-line bg-surface-paper text-secondary-900"
      @click="mobileOpen = true"
      aria-label="Abrir menú"
    >
      <svg
        width="18"
        height="18"
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

  <!-- Menú móvil a pantalla completa (diseño v4 `V3MobMenu`). -->
  <Drawer v-model:visible="mobileOpen" position="full" :block-scroll="true">
    <template #container="{ closeCallback }">
      <div class="flex h-full flex-col overflow-y-auto bg-surface-page text-secondary-900">
        <div class="flex items-center justify-between border-b border-line px-[1.125rem] py-3.5">
          <img src="@/assets/fractal.png" alt="Fractal Studio" class="h-9 w-auto" />
          <button
            type="button"
            class="grid size-10 place-items-center rounded-full bg-secondary-900 text-white"
            aria-label="Cerrar menú"
            @click="closeCallback"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <nav class="flex flex-col px-5 py-6">
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            @click="mobileOpen = false"
            :class="[
              'flex items-center justify-between border-b border-line py-5 font-display text-[1.75rem] font-bold tracking-[-0.02em]',
              isActive(item.to) ? 'text-primary-500' : 'text-secondary-900',
            ]"
          >
            {{ item.label }}
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </nav>

        <div class="flex flex-col gap-2 border-t-4 border-surface-cream px-5 py-6">
          <template v-if="isLoggedIn">
            <RouterLink :to="{ name: classroomHomeRoute }" @click="mobileOpen = false">
              <LandingButton size="lg" class="w-full justify-between!">Mi aula</LandingButton>
            </RouterLink>
            <!-- Atajo al perfil, igual que el chip del desktop. -->
            <RouterLink
              :to="{ name: 'classroom-account' }"
              class="flex items-center justify-center gap-2.5 py-2.5 font-body text-[0.9375rem] font-medium"
              @click="mobileOpen = false"
            >
              <span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary-500 font-display text-[0.8125rem] font-bold text-white">
                {{ initials }}
              </span>
              {{ firstName }}
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/programs" @click="mobileOpen = false">
              <LandingButton size="lg" class="w-full justify-between!">Postular ahora</LandingButton>
            </RouterLink>
            <RouterLink :to="{ name: 'classroom-login' }" @click="mobileOpen = false">
              <LandingButton variant="ghost" size="md" :arrow="false" class="w-full justify-center">
                Iniciar sesión
              </LandingButton>
            </RouterLink>
          </template>
        </div>

        <!-- Solo los canales que cargó el panel; sin ninguno, no hay bloque. -->
        <div v-if="quickContacts.length" class="border-t border-line px-5 py-6">
          <p class="mb-3.5 font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">Contacto rápido</p>
          <div class="flex flex-col gap-2.5">
            <a
              v-for="c in quickContacts"
              :key="c.label"
              :href="c.href"
              :target="c.external ? '_blank' : undefined"
              :rel="c.external ? 'noopener' : undefined"
              class="flex items-center gap-3 rounded-adm-md border border-line bg-surface-paper px-4 py-3.5"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-adm-sm bg-accent-soft text-primary-500">
                <svg v-if="c.icon === 'whatsapp'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z" />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7L12 13L22 7" />
                </svg>
              </span>
              <span class="min-w-0">
                <span class="block text-[0.813rem] text-secondary-500">{{ c.label }}</span>
                <span class="mt-0.5 block truncate font-display text-[0.938rem] font-bold">{{ c.value }}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>
