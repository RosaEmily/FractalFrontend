<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AvatarCore, HeroCore, ImageCore } from "@/shared/components";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import { safeRequest } from "@/shared/utils/request";
import coordinatorService from "../services/coordinator.service";
import teacherService from "../services/teacher.service";
import { clearSession } from "@/shared/utils/session";
import authService from "@/modules/admin/services/auth.service";
import Logo from "@/assets/fractal.png";
import {
  mdiMenu,
  mdiClose,
  mdiAccountCircleOutline,
  mdiLogoutVariant,
  mdiWhatsapp,
} from "@mdi/js";
import NavClassroom from "../components/nav-classroom.vue";
import NotificationBell from "../components/notification-bell.vue";
import SearchBox from "../components/search-box.vue";
import { useClassroomRole } from "../composables/useClassroomRole";
import {
  CLASSROOM_ROLE_LABEL,
  CLASSROOM_SUPPORT,
} from "../constants/labels";
import { AulaPill } from "../components/ui";

const route = useRoute();
const router = useRouter();
const { menu, fullName, initials, user, activeRole, isStudent } =
  useClassroomRole();

/** En móvil el sidebar es un cajón que se superpone, no una columna. */
const drawerOpen = ref(false);

const openMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
useClickOutsideMulti([menuRef, panelRef], () => (openMenu.value = false));

const roleLabel = computed(() =>
  activeRole.value ? (CLASSROOM_ROLE_LABEL[activeRole.value] ?? "") : "",
);

/**
 * La topbar muestra dónde está el usuario, no la marca: el logo vive en el
 * sidebar. El título sale del ítem de menú activo, y si es una pantalla de
 * detalle, del `title` que declara la ruta.
 */
const currentTitle = computed(() => {
  const name = String(route.name ?? "");
  const item = menu.value.find((i) => i.route === name);

  if (item) return item.label;

  const page = route.meta.page as { base?: { title?: string } } | undefined;
  return page?.base?.title ?? "Aula";
});

/**
 * Contadores del menú. Se cargan una vez al montar el shell: son un resumen,
 * no necesitan refrescarse en cada navegación.
 */
const badges = ref<Record<string, number>>({});

onMounted(async () => {
  if (activeRole.value === "COORDINATOR") {
    const { data } = await safeRequest(() => coordinatorService.attention(), {
      showAlert: false,
    });
    badges.value = { attention: (data ?? []).length };
    return;
  }

  if (activeRole.value === "TEACHER") {
    /*
     * Notas por registrar: celdas vacías en los cursos en marcha. Solo se
     * consultan esos — un curso cerrado ya no tiene nada que cargar.
     */
    const { data: courses } = await safeRequest(() => teacherService.courses(), {
      showAlert: false,
    });

    const active = (courses ?? []).filter((c) => c.state === "in_progress");
    const books = await Promise.all(
      active.map((c) =>
        safeRequest(() => teacherService.gradebook(c.id), { showAlert: false }),
      ),
    );

    badges.value = {
      grading: books.reduce(
        (total, { data }) =>
          total +
          (data?.students ?? []).reduce(
            (sum, student) =>
              sum + student.scores.filter((x) => x.score === null).length,
            0,
          ),
        0,
      ),
    };
  }
});

/** Solo el alumno tiene "Mi cuenta": docente y coordinación no la usan. */
const showAccount = computed(() => activeRole.value === "STUDENT");

const goAccount = () => {
  openMenu.value = false;
  router.push({ name: "classroom-account" });
};

const logout = async () => {
  openMenu.value = false;
  // Si el token ya venció el logout responde 401 y el interceptor se encarga;
  // no debe impedir que se limpie la sesión local.
  await safeRequest(() => authService.logout(), { showAlert: false });
  // Solo la del aula: la sesión del panel, si está abierta, sigue viva — el
  // backend borra únicamente la cookie de la zona en la que se hizo logout.
  clearSession("classroom");
  router.push({ name: "classroom-login" });
};
</script>

<template>
  <div class="h-dvh flex bg-admin-bg">
    <!--
      Sidebar: el logo vive acá, no en la topbar. Fondo `paper` (blanco) para
      separarlo del lienzo cream de la página.
    -->
    <aside
      class="hidden lg:flex w-62 shrink-0 flex-col bg-surface-paper border-r border-line"
    >
      <div class="px-5 pt-6 pb-4">
        <ImageCore image-class="h-8" :src="Logo" />
      </div>

      <div class="flex-1 overflow-y-auto px-3">
        <NavClassroom :items="menu" :badges="badges" />
      </div>

      <!-- Soporte: cierra el sidebar y da salida cuando algo no cuadra -->
      <div
        class="m-3.5 p-4 rounded-adm-lg bg-surface-cream border border-line"
      >
        <span
          class="font-mono text-adm-xs text-secondary-400 tracking-[0.08em] uppercase block"
        >
          {{ CLASSROOM_SUPPORT.eyebrow }}
        </span>
        <p class="text-adm-sm text-secondary-500 leading-relaxed mt-2 mb-3">
          {{ CLASSROOM_SUPPORT.question }}
        </p>
        <a
          :href="CLASSROOM_SUPPORT.href"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-adm-sm font-semibold text-primary-600"
        >
          <HeroCore :path="mdiWhatsapp" class="size-4 text-success-DEFAULT" />
          {{ CLASSROOM_SUPPORT.action }}
        </a>
      </div>
    </aside>

    <!-- Móvil: cajón sobre el contenido, para no perder ítems del menú -->
    <transition name="fade">
      <div
        v-if="drawerOpen"
        class="lg:hidden fixed inset-0 z-60 bg-secondary-900/40"
        @click="drawerOpen = false"
      />
    </transition>
    <transition name="slide-left">
      <aside
        v-if="drawerOpen"
        class="lg:hidden fixed inset-y-0 left-0 z-61 w-72 bg-surface-paper border-r border-line flex flex-col"
      >
        <div class="flex items-center justify-between px-5 pt-6 pb-4">
          <ImageCore image-class="h-8" :src="Logo" />
          <button
            type="button"
            class="adm-icon-btn"
            aria-label="Cerrar menú"
            @click="drawerOpen = false"
          >
            <HeroCore :path="mdiClose" class="size-5 text-secondary-900" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-3" @click="drawerOpen = false">
          <NavClassroom :items="menu" :badges="badges" />
        </div>
      </aside>
    </transition>

    <div class="flex-1 min-w-0 flex flex-col">
      <header
        class="shrink-0 h-16 px-4 sm:px-7 flex items-center gap-3.5 bg-surface-paper/85 backdrop-blur-md border-b border-line"
      >
        <button
          type="button"
          class="adm-icon-btn lg:hidden"
          aria-label="Abrir menú"
          @click="drawerOpen = true"
        >
          <HeroCore :path="mdiMenu" class="size-5 text-secondary-900" />
        </button>

        <ImageCore image-class="h-7 lg:hidden" :src="Logo" />

        <div class="hidden lg:flex items-center gap-2.5 min-w-0">
          <span
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight truncate"
          >
            {{ currentTitle }}
          </span>
          <AulaPill v-if="roleLabel" tone="accent" size="sm">
            {{ roleLabel }}
          </AulaPill>
        </div>

        <div class="flex-1" />

        <!--
          El buscador va en los TRES roles, cada uno con su índice (el alumno
          busca en lo suyo, el docente en sus cursos y clases, coordinación en
          las cohortes abiertas).

          La campana, en cambio, sigue siendo solo del alumno: `/me/notifications`
          es `authorize:STUDENT` y no existe un endpoint de avisos para docente
          ni coordinación. Mostrarla vacía sería peor que no mostrarla.
        -->
        <SearchBox class="hidden md:block" />
        <NotificationBell v-if="isStudent" />

        <div class="relative">
          <div ref="menuRef" class="cursor-pointer" @click="openMenu = !openMenu">
            <AvatarCore :text="initials || fullName" shape="circle" />
          </div>

          <transition name="fade-scale">
            <div
              v-if="openMenu"
              ref="panelRef"
              class="absolute right-0 top-12 bg-surface-paper border border-line min-w-64 p-1.5 z-9999 rounded-adm-lg shadow-lg"
            >
              <div
                class="px-3.5 pt-3.5 pb-3 border-b border-line-soft flex items-center gap-3"
              >
                <AvatarCore :text="initials || fullName" shape="circle" />
                <div class="min-w-0 flex-1">
                  <div
                    class="font-display text-adm-base font-bold text-secondary-900 tracking-tight truncate"
                  >
                    {{ fullName }}
                  </div>
                  <div class="text-adm-sm text-secondary-500 truncate mt-0.5">
                    {{ user?.email }}
                  </div>
                </div>
              </div>

              <div v-if="showAccount" class="py-1.5">
                <div
                  class="adm-nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-adm-sm cursor-pointer text-adm-base text-secondary-900"
                  @click="goAccount"
                >
                  <HeroCore
                    :path="mdiAccountCircleOutline"
                    class="size-4 text-secondary-500"
                  />
                  <span class="flex-1">Mi cuenta</span>
                </div>
              </div>

              <div class="h-px bg-line-soft mx-1.5" />

              <div
                class="adm-nav-item flex items-center gap-2.5 px-3.5 py-2.5 mt-1.5 rounded-adm-sm cursor-pointer text-adm-base text-danger-DEFAULT font-semibold"
                @click="logout"
              >
                <HeroCore :path="mdiLogoutVariant" class="size-4" />
                <span>Cerrar sesión</span>
              </div>
            </div>
          </transition>
        </div>
      </header>

      <main class="flex-1 min-w-0 overflow-y-auto px-4 sm:px-7 py-6">
        <!--
          Cada pantalla muestra su propio esqueleto mientras pide su servicio,
          así que acá no hace falta uno de ruta: sería una espera fingida
          encima de una real. Lo que sí se conserva del diseño es el fade de
          entrada, para que el contenido no aparezca de golpe.
        -->
        <RouterView v-slot="{ Component, route: current }">
          <component :is="Component" :key="current.fullPath" class="aula-fade" />
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
/*
 * `fade-scale` se usa en el admin pero nunca se definió, así que ahí la
 * transición no anima. Se declara acá para que el menú de usuario abra con el
 * gesto del diseño.
 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s cubic-bezier(0.2, 0.7, 0.3, 1);
  transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.22s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
