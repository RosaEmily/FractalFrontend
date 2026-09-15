<script setup lang="ts">
import { AvatarCore, HeroCore } from "@/shared/components";
import ListNavVertical from "./list.vue";
import { computed, ref } from "vue";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { MENU } from "../../constants/menu";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/useUserStore";
import type { MenuItem } from "../../interface/nav-vertical";

const router = useRouter();
const userStore = useUserStore();

withDefaults(
  defineProps<{
    avatar?: string;
    fullName?: string;
    role?: string;
  }>(),
  {
    avatar: "",
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
 * Menú filtrado por rol (`ADM_NAV_ACCESS` del diseño).
 *
 * Cada ítem ya declaraba `roles`, pero nadie lo leía: el menú se pintaba entero
 * para todos, así que un COORDINATOR o un MANAGER veían opciones que la API
 * les responde con 403.
 *
 * Un grupo desaparece si ninguno de sus hijos sobrevive al filtro — un grupo
 * vacío es peor que ninguno.
 *
 * ⚠️ La seguridad real la dan el guard de rutas y la API; esto es UX: no
 * ofrecer lo que no se puede usar.
 */
const allowed = (item: MenuItem, roles: string[]): boolean =>
  !item.roles?.length || item.roles.some((role) => roles.includes(role));

const filterByRoles = (items: MenuItem[], roles: string[]): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    if (!allowed(item, roles)) return acc;

    if (!item.children?.length) {
      acc.push(item);
      return acc;
    }

    const children = filterByRoles(item.children, roles);
    if (children.length) acc.push({ ...item, children });

    return acc;
  }, []);

const menu = computed<MenuItem[]>(() => {
  const roles = userStore.roles;
  // Sin perfil cargado todavía no se filtra: el layout monta el nav antes de
  // que llegue `auth/me`, y esconder todo provocaría un parpadeo del menú.
  if (!roles.length) return MENU;

  return filterByRoles(MENU, roles);
});

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
      <AvatarCore size="large" :text="avatar" shape="circle" />
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
        @menu-click="onRedirect"
      />
    </nav>

    <!-- Botón de colapso, anclado al pie como en el diseño -->
    <div
      class="border-t border-line mt-2.5 pt-2.5"
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
