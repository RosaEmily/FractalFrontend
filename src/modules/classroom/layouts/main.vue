<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { HeroCore, ImageCore } from "@/shared/components";
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
  mdiCheck,
  mdiLogoutVariant,
  mdiWhatsapp,
  mdiChevronDown,
  mdiMagnify,
} from "@mdi/js";
import NavClassroom from "../components/nav-classroom.vue";
import NotificationBell from "../components/notification-bell.vue";
import SearchBox from "../components/search-box.vue";
import { useClassroomRole } from "../composables/useClassroomRole";
import {
  CLASSROOM_ROLE_ICON,
  CLASSROOM_ROLE_LABEL,
  CLASSROOM_SUPPORT,
} from "../constants/labels";
import { classroomHomeFor } from "../constants/menu";
import { AulaAvatar, AulaPill } from "../components/ui";

const route = useRoute();
const router = useRouter();
const {
  menu,
  fullName,
  firstName,
  user,
  activeRole,
  classroomRoles,
  hasMultipleRoles,
  switchRole,
} = useClassroomRole();

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

/**
 * Carga los contadores del rol activo.
 *
 * ⚠️ Se vuelve a llamar al CAMBIAR DE VISTA, no solo al montar: cada rol tiene
 * los suyos y el shell no se desmonta al cambiar, así que sin esto el badge del
 * rol anterior se quedaría pegado en el menú del nuevo.
 */
const loadBadges = async () => {
  badges.value = {};

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
};

/*
 * Se observa el rol activo en vez de llamar a mano en cada punto: el cambio de
 * vista puede venir del menú, pero TAMBIÉN del guard cuando se abre un enlace
 * directo a una pantalla del otro rol. `immediate` cubre el montaje.
 */
watch(activeRole, loadBadges, { immediate: true });

const goAccount = () => {
  openMenu.value = false;
  router.push({ name: "classroom-account" });
};

/**
 * Cambia la vista activa sin tocar la sesión: el token y el perfil son los
 * mismos, solo cambia con qué cara del perfil se dibuja el aula.
 *
 * Se navega a la home del rol nuevo y no se conserva la pantalla actual: el
 * menú cambia por completo, y la ruta en la que se estaba pertenece al rol que
 * se acaba de dejar — el guard la rebotaría de todos modos.
 */
const changeRole = (role: string) => {
  openMenu.value = false;

  if (!switchRole(role)) return;

  router.push({ name: classroomHomeFor(classroomRoles.value, role) });
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
  <!-- `aula`: ancla del scrollbar crema del diseño (ver `style.css`). -->
  <div class="aula h-dvh flex bg-surface-page">
    <!--
      Sidebar: el logo vive acá, no en la topbar. Fondo `paper` (blanco) para
      separarlo del lienzo cream de la página.
    -->
    <aside
      class="hidden lg:flex w-62 shrink-0 flex-col bg-surface-paper border-r border-line"
    >
      <div class="px-5 pt-6 pb-4">
        <!--
          El diseño (`V3Logo`) no lo envuelve en nada: es un mockup de UNA
          pantalla, sin landing a la que volver. Acá sí hay una, y el logo es
          el gesto estándar para llegar a ella desde cualquier zona logueada.
        -->
        <RouterLink :to="{ name: 'home' }">
          <ImageCore image-class="h-8" :src="Logo" />
        </RouterLink>
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
          <RouterLink :to="{ name: 'home' }" @click="drawerOpen = false">
            <ImageCore image-class="h-8" :src="Logo" />
          </RouterLink>
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
      <!--
        ⚠️ `relative z-50` en el HEADER, no en el panel que cuelga de él.

        `backdrop-blur-md` crea un CONTEXTO DE APILAMIENTO: el `z-9999` de la
        campana y del menú de usuario solo compite DENTRO del header, así que
        por alto que sea nunca pasa por encima del `<main>`, que es su hermano
        posterior. Los paneles se veían por debajo de las tarjetas.

        Quien tiene que ganarle a `<main>` es el header entero.
      -->
      <header
        class="relative z-50 shrink-0 h-16 px-4 sm:px-7 flex items-center gap-3.5 bg-surface-paper/85 backdrop-blur-md border-b border-line"
      >
        <button
          type="button"
          class="adm-icon-btn lg:hidden"
          aria-label="Abrir menú"
          @click="drawerOpen = true"
        >
          <HeroCore :path="mdiMenu" class="size-5 text-secondary-900" />
        </button>

        <RouterLink :to="{ name: 'home' }" class="lg:hidden">
          <ImageCore image-class="h-7" :src="Logo" />
        </RouterLink>

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

          La campana se muestra en los TRES roles, como el diseño. Solo el
          alumno tiene avisos (`/me/notifications` es `authorize:STUDENT`), así
          que a los demás no se les pide nada y el panel dice por qué está
          vacío: el propio componente lo resuelve.
        -->
        <SearchBox class="hidden md:block" />
        <!--
          En móvil no entra el campo: la lupa NAVEGA a la página de búsqueda,
          como en el diseño (shell.jsx:512).
        -->
        <button
          type="button"
          class="adm-icon-btn md:hidden"
          aria-label="Buscar"
          @click="router.push({ name: 'classroom-search' })"
        >
          <HeroCore :path="mdiMagnify" class="size-4.5 text-secondary-500" />
        </button>
        <NotificationBell />

        <div class="relative">
          <!--
            Nombre y rol al lado del avatar, como el diseño (shell.jsx:474):
            el aula es multi-rol y el mismo usuario entra como docente o como
            coordinación, así que sin el rol a la vista no se sabe con cuál se
            está operando. Se ocultan en móvil, donde queda solo el avatar.
          -->
          <div
            ref="menuRef"
            class="flex cursor-pointer items-center gap-2.5"
            @click="openMenu = !openMenu"
          >
            <AulaAvatar
              :name="fullName"
              :photo="user?.photo_url"
              :size="38"
            />
            <div class="hidden leading-tight md:block">
              <div class="text-adm-base font-semibold text-secondary-900">
                {{ firstName || fullName }}
              </div>
              <div class="font-mono text-adm-xs text-secondary-400">
                {{ roleLabel }}
              </div>
            </div>
            <HeroCore
              :path="mdiChevronDown"
              class="hidden size-4 shrink-0 text-secondary-400 md:block"
            />
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
                <AulaAvatar
              :name="fullName"
              :photo="user?.photo_url"
              :size="38"
            />
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

              <!-- "Mi cuenta" en los tres roles: el perfil ya no es del alumno. -->
              <div class="py-1.5">
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

              <!--
                Cambiar de vista: solo aparece con más de un rol. Con uno solo
                sería una lista de un elemento que no hace nada.
              -->
              <div v-if="hasMultipleRoles" class="py-1.5 border-t border-line-soft">
                <p
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] px-3.5 py-1.5"
                >
                  Cambiar de vista
                </p>

                <div
                  v-for="role in classroomRoles"
                  :key="role"
                  class="adm-nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-adm-sm cursor-pointer text-adm-base"
                  :class="
                    role === activeRole
                      ? 'bg-accent-soft text-primary-600 font-semibold'
                      : 'text-secondary-900'
                  "
                  @click="changeRole(role)"
                >
                  <HeroCore
                    :path="CLASSROOM_ROLE_ICON[role]"
                    class="size-4"
                    :class="
                      role === activeRole ? 'text-primary-500' : 'text-secondary-500'
                    "
                  />
                  <span class="flex-1">{{ CLASSROOM_ROLE_LABEL[role] ?? role }}</span>
                  <HeroCore
                    v-if="role === activeRole"
                    :path="mdiCheck"
                    class="size-4 text-primary-500"
                  />
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
        <!--
          ⚠️ La key es el PATH, no el `fullPath`: este último incluye la query
          string, así que cambiar de pestaña (`?tab=sessions`) destruía y
          recreaba la página entera — el nombre del encabezado desaparecía
          hasta que `auth/profile` volvía a responder.

          Lo que la key tiene que distinguir es una pantalla de OTRA (pasar de
          `/curso/1` a `/curso/2` sí debe recargar, y eso ya está en el path);
          la query es estado DENTRO de la misma pantalla.
        -->
        <RouterView v-slot="{ Component, route: current }">
          <component :is="Component" :key="current.path" class="aula-fade" />
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
