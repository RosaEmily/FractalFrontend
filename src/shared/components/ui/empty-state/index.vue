<script setup lang="ts">
import { computed } from "vue";
import { mdiInboxOutline } from "@mdi/js";
import { HeroCore } from "@/shared/components/core";

/**
 * Estado vacío único del panel: icono en un círculo suave, título corto y una
 * línea de ayuda. `success` es para "no hay nada pendiente" (buena noticia, no
 * un vacío); `compact` para paneles chicos (Inicio, listas dentro de tarjetas).
 * Las acciones (p. ej. "Limpiar filtros") entran por el slot.
 */
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    /** Ruta de icono @mdi/js. */
    icon?: string;
    tone?: "neutral" | "success";
    compact?: boolean;
  }>(),
  { icon: mdiInboxOutline, tone: "neutral" },
);

const bubble = computed(() =>
  props.tone === "success"
    ? "bg-success-soft text-success-DEFAULT"
    : "bg-admin-bg text-secondary-400",
);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center px-6"
    :class="compact ? 'py-7 gap-1' : 'py-12 gap-1.5'"
    role="status"
  >
    <span
      class="grid place-items-center rounded-full border border-line-soft mb-1.5"
      :class="[bubble, compact ? 'size-10' : 'size-14']"
    >
      <HeroCore :path="icon" :size="compact ? 20 : 26" />
    </span>
    <p
      class="font-display font-bold text-secondary-900 tracking-tight m-0"
      :class="compact ? 'text-adm-base' : 'text-adm-lg'"
    >
      {{ title }}
    </p>
    <p v-if="description" class="text-adm-sm text-secondary-400 m-0 max-w-sm leading-relaxed">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-3"><slot /></div>
  </div>
</template>
