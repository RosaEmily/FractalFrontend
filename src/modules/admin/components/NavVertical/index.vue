<script setup lang="ts">
import { AvatarCore, HeroCore } from "@/shared/components";
import ListNavVertical from "./list.vue";
import { computed, ref } from "vue";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { MENU } from "../../constants/menu";
import { filterMenuByPermissions } from "../../constants/permissions";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/useUserStore";
import type { MenuItem } from "../../interface/nav-vertical";

const router = useRouter();
const userStore = useUserStore();

withDefaults(
  defineProps<{
    avatar?: string;
    /** Nombre para las iniciales si `avatar` es una URL que no carga. */
    avatarFallback?: string;
    fullName?: string;
    role?: string;
  }>(),
  {
    avatar: "",
    avatarFallback: "",
    fullName: "",
    role: "",
  },
);

/** Clave de localStorage para recordar el estado entre recargas. */
const STORAGE_KEY = "admin:nav-collapsed";

const isCollapsed = ref<boolean>(
  localStorage.getItem(STORAGE_KEY) === "true",
);

/**
 * Menú filtrado por PERMISOS: cada ítem sale del permiso de su ruta
 * (`permissionForRoute`), así que no hay una segunda lista que mantener en
 * sincronía con el guard del router.
 *
 * Un grupo desaparece si ninguno de sus hijos sobrevive al filtro — un grupo
 * vacío es peor que ninguno.
 *
 * ⚠️ La seguridad real la dan el guard de rutas y la API; esto es UX: no
 * ofrecer lo que no se puede usar.
 */
const menu = computed<MenuItem[]>(() => filterMenuByPermissions(MENU, userStore.permissions));

/**
 * Grupos que el usuario abrió a mano, por `id`.
 *
 * Vive acá y no en `item.show` porque `MENU` es una constante de módulo (no
 * reactiva) y `filterByRoles` devuelve copias: mutar el ítem no re-renderizaba
 * y el estado se perdía al reevaluarse `menu`.
 *
 * Un `Set` en un `ref` no es reactivo por mutación: hay que reasignarlo.
 */
const openGroups = ref<Set<string | number>>(new Set());

const toggleGroup = (id: string | number) => {
  const next = new Set(openGroups.value);
  next.has(id) ? next.delete(id) : next.add(id);
  openGroups.value = next;
};

const toggleLabel = computed(() =>
  isCollapsed.value ? "Expandir menú" : "Colapsar menú",
);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem(STORAGE_KEY, String(isCollapsed.value));
};

const onRedirect = (item: MenuItem) => {
  if (!item.route) return;
  router.push(item.route);
};
</script>

<template>
  <aside
    class="shrink-0 h-full bg-admin-pane border-r border-line flex flex-col py-5 transition-[width] duration-200"
    :class="isCollapsed ? 'w-18' : 'w-64'"
  >
    <!-- Tarjeta de usuario: colapsada muestra solo el avatar -->
    <div
      class="mb-4.5 bg-surface-paper rounded-adm-md border border-line flex items-center gap-3"
      :class="isCollapsed ? 'mx-3 p-2 justify-center' : 'mx-4 p-3'"
    >
      <AvatarCore
        size="large"
        :text="avatar"
        :fallback-text="avatarFallback || fullName"
        shape="circle"
      />
      <div v-if="!isCollapsed" class="min-w-0 flex-1">
        <div
          class="font-display text-adm-base font-bold text-secondary-900 tracking-tight truncate"
        >
          {{ fullName }}
        </div>
        <div
          class="font-mono text-adm-xs text-primary-500 mt-0.5 tracking-[0.08em] font-semibold"
        >
          {{ role }}
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto" :class="isCollapsed ? 'px-3' : 'px-2.5'">
      <ListNavVertical
        :menu="menu"
        :isCollapsed="isCollapsed"
        :open-groups="openGroups"
        @menu-click="onRedirect"
        @toggle-group="toggleGroup"
      />
    </nav>

    <!-- Botón de colapso, anclado al pie como en el diseño -->
    <div
      class="hidden lg:block border-t border-line mt-2.5 pt-2.5"
      :class="isCollapsed ? 'px-3' : 'px-2.5'"
    >
      <button
        type="button"
        class="adm-nav-item w-full flex items-center gap-2.5 rounded-adm-sm cursor-pointer text-adm-base text-secondary-500"
        :class="isCollapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'"
        :title="toggleLabel"
        :aria-label="toggleLabel"
        :aria-expanded="!isCollapsed"
        @click="toggleCollapse"
      >
        <HeroCore
          :path="isCollapsed ? mdiChevronRight : mdiChevronLeft"
          class="size-4 shrink-0"
        />
        <span v-if="!isCollapsed">Colapsar menú</span>
      </button>
    </div>
  </aside>
</template>
