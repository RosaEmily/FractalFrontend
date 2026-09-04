<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { CLASSROOM_PARENT, type ClassroomMenuItem } from "../constants/menu";

const props = defineProps<{
  items: ClassroomMenuItem[];
  /** Rail de 76px: solo iconos, para tablet. */
  collapsed?: boolean;
  /** Contadores por `badgeKey`. Un 0 no se muestra: no hay nada pendiente. */
  badges?: Record<string, number>;
}>();

const badgeOf = (item: ClassroomMenuItem) =>
  item.badgeKey ? (props.badges?.[item.badgeKey] ?? 0) : 0;

const route = useRoute();
const router = useRouter();

/**
 * Ruta con la que se resuelve el ítem activo.
 *
 * Un detalle (curso, sesión, matrícula) no tiene entrada propia en el menú, así
 * que hereda la de su pantalla padre; y si se llegó desde otro lugar,
 * `query.from` manda sobre ese padre por defecto.
 */
const activeRoute = computed(() => {
  const name = String(route.name ?? "");
  const from = route.query.from as string | undefined;

  return CLASSROOM_PARENT[name] ? (from ?? CLASSROOM_PARENT[name]) : name;
});

const isActive = (item: ClassroomMenuItem) => activeRoute.value === item.route;

const go = (item: ClassroomMenuItem) => {
  if (isActive(item)) return;
  router.push({ name: item.route });
};
</script>

<template>
  <nav class="flex flex-col gap-1">
    <button
      v-for="item in props.items"
      :key="item.route"
      type="button"
      :title="props.collapsed ? item.label : undefined"
      :aria-current="isActive(item) ? 'page' : undefined"
      class="adm-nav-item relative flex items-center rounded-adm-sm text-adm-base transition-colors cursor-pointer"
      :class="[
        props.collapsed ? 'justify-center size-10' : 'gap-3 px-3.5 py-2.5',
        isActive(item)
          ? 'bg-accent-soft text-primary-500 font-semibold'
          : 'text-secondary-900',
      ]"
      @click="go(item)"
    >
      <!-- Barra del diseño: marca el activo también cuando solo hay icono -->
      <span
        v-if="isActive(item)"
        class="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-pill bg-primary-500"
      />
      <!-- El badge va sobre el icono, así también se ve en el rail -->
      <span class="relative inline-flex shrink-0">
        <HeroCore
          :path="item.icon"
          class="size-4"
          :class="isActive(item) ? 'text-primary-500' : 'text-secondary-500'"
        />
        <span
          v-if="badgeOf(item)"
          class="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-pill bg-primary-500 text-white font-mono text-adm-xs font-bold inline-flex items-center justify-center"
        >
          {{ badgeOf(item) }}
        </span>
      </span>
      <span v-if="!props.collapsed" class="truncate">{{ item.label }}</span>
    </button>
  </nav>
</template>
