<script setup lang="ts">
import { mdiChevronUp, mdiChevronDown } from "@mdi/js";
import { HeroCore } from "@/shared/components";
import ListNavVertical from "./list.vue";

import type { MenuItem } from "@/modules/admin/interface/nav-vertical";

import { useRoute } from "vue-router";
import type {
  RouteLocationNormalizedLoadedGeneric,
  RouteLocationRaw,
} from "vue-router";

import { computed } from "vue";

const route = useRoute();

const props = withDefaults(
  defineProps<{
    item: MenuItem;
    isCollapsed?: boolean;
    /** Ids de los grupos abiertos. El estado vive en el nav, no en el ítem. */
    openGroups: Set<string | number>;
  }>(),
  {
    isCollapsed: false,
  },
);

const emit = defineEmits<{
  (e: "menu-click", item: MenuItem): void;
  (e: "toggle-group", id: string | number): void;
}>();

const getRouteName = (route?: RouteLocationRaw | null): string | null => {
  if (!route || typeof route === "string") return null;
  if ("name" in route) return route.name as string;
  return null;
};

/**
 * El `module` matchea contra el PREFIJO del nombre de ruta, no como
 * substring suelto: con `includes`, estando en `reports.certificates` se
 * activaba también el módulo `certificates` y quedaban dos ítems marcados.
 *
 * Se compara por segmentos (`a.b` matchea `a.b.list` pero no `a.bc.list`),
 * así un módulo nuevo no puede activar a otro por accidente.
 */
const matchesModule = (routeName: string, module: string): boolean =>
  routeName === module || routeName.startsWith(`${module}.`);

const isActiveMenuItem = (
  route: RouteLocationNormalizedLoadedGeneric,
  item: MenuItem,
): boolean => {
  return (
    route.name === getRouteName(item.route) ||
    (typeof route.name === "string" &&
      typeof item.module === "string" &&
      matchesModule(route.name, item.module))
  );
};

const isActive = computed(() => {
  const { item } = props;
  if (!item.route) return false;
  return isActiveMenuItem(route, item);
});

const hasActiveChild = (items?: MenuItem[]): boolean => {
  if (!items?.length) return false;
  return items.some((item) => {
    if (isActiveMenuItem(route, item)) {
      return true;
    }
    return hasActiveChild(item.children);
  });
};

/**
 * El grupo está abierto si el usuario lo abrió, o si contiene la ruta actual.
 *
 * ⚠️ El estado NO puede vivir en `item.show`: los ítems vienen de la constante
 * `MENU` (no reactiva) y además el filtro por roles del nav devuelve COPIAS
 * (`{ ...item, children }`), así que mutar el ítem no re-renderizaba nada y el
 * valor se perdía en cuanto el computed del menú se reevaluaba. Ese era el bug
 * de "hago clic y el menú no despliega".
 */
const show = computed(() => {
  const { item, openGroups } = props;
  if (!item.children?.length) return false;
  if (openGroups.has(item.id)) return true;
  return hasActiveChild(item.children);
});

const hasChildren = computed(() => {
  return !!props.item.children?.length;
});

const menuClick = () => {
  const { item, isCollapsed } = props;
  if (item.children?.length) {
    // Colapsado los hijos se muestran siempre: no hay nada que alternar.
    if (!isCollapsed) emit("toggle-group", item.id);
  } else {
    emit("menu-click", item);
  }
};
</script>

<template>
  <!--
    Colapsado el diseño no oculta los hijos: el título del grupo se reduce a
    un icono tenue y cada hijo queda como un botón cuadrado con tooltip.
  -->
  <template v-if="isCollapsed">
    <li
      v-if="hasChildren"
      class="flex justify-center pt-1.5 pb-0.5 opacity-50"
      :title="item.label"
    >
      <HeroCore v-if="item.icon" :path="item.icon" class="size-3.5 text-secondary-500" />
    </li>

    <li
      v-else
      class="adm-nav-item relative size-10 mx-auto flex items-center justify-center rounded-adm-sm cursor-pointer border"
      :class="
        isActive
          ? 'is-active bg-surface-paper border-line shadow-sm'
          : 'border-transparent'
      "
      :title="item.label"
      @click="menuClick"
    >
      <span
        v-if="isActive"
        class="absolute -left-1 top-1.5 bottom-1.5 w-0.75 rounded-pill bg-primary-500"
      />
      <HeroCore
        v-if="item.icon"
        :path="item.icon"
        size="20"
        :class="isActive ? 'text-primary-500' : 'text-secondary-500'"
      />
    </li>
  </template>

  <li
    v-else
    class="adm-nav-item relative rounded-adm-sm cursor-pointer flex items-center justify-between px-3 py-2.5 border"
    :class="[
      hasChildren
        ? 'border-transparent font-semibold text-secondary-900'
        : isActive
          ? 'is-active bg-surface-paper border-line shadow-sm font-semibold text-secondary-900'
          : 'border-transparent font-medium text-secondary-500',
    ]"
    @click="menuClick"
  >
    <span
      v-if="!hasChildren && isActive"
      class="absolute -left-1 top-2 bottom-2 w-0.75 rounded-pill bg-primary-500"
    />
    <div class="flex gap-2.5 items-center">
      <HeroCore
        v-if="item.icon"
        :path="item.icon"
        size="20"
        :class="!hasChildren && isActive ? 'text-primary-500' : 'text-secondary-500'"
      />
      <span class="text-adm-base">
        {{ item.label }}
      </span>
    </div>

    <HeroCore
      v-show="item.children?.length"
      :path="show ? mdiChevronUp : mdiChevronDown"
      size="20"
      class="text-secondary-500"
    />
  </li>

  <!-- Colapsado los hijos se muestran siempre, como iconos. -->
  <ListNavVertical
    v-show="hasChildren && (isCollapsed || show)"
    :class="isCollapsed ? 'flex flex-col gap-1' : 'ml-4 pl-3 border-l border-line'"
    :menu="item.children ?? []"
    :is-collapsed="isCollapsed"
    :open-groups="openGroups"
    @menu-click="emit('menu-click', $event)"
    @toggle-group="emit('toggle-group', $event)"
  />
</template>
