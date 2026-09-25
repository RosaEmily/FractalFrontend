<script setup lang="ts">
import { computed } from "vue";
import { HeroCore } from "@/shared/components";
import { mdiFlagOutline } from "@mdi/js";

const props = withDefaults(
  defineProps<{
    title?: string;
    tone?: "info" | "warning" | "danger" | "success";
    icon?: string;
  }>(),
  { tone: "warning", icon: mdiFlagOutline },
);

/**
 * Fondo + borde del bloque, y el tono oscuro que comparten icono y título.
 *
 * ⚠️ El diseño (`AulaNotice`, shell.jsx:370) usa TRES colores, no uno: el tono
 * oscuro (`fg`) en icono y título, y el gris de texto normal (`ink2`) en el
 * cuerpo. Pintar el bloque entero del color vivo —lo que hacía antes— deja el
 * texto lavado sobre su propio fondo y baja el contraste de la explicación.
 *
 * El borde va OPACO. `-DEFAULT/25` sobre el crema del aula vira a gris.
 */
const TONES: Record<string, string> = {
  info: "bg-info-soft border-info-line",
  warning: "bg-amber-soft border-amber-line",
  danger: "bg-danger-soft border-danger-line",
  success: "bg-success-soft border-success-line",
};

const HEAD_TONES: Record<string, string> = {
  info: "text-info-deep",
  warning: "text-amber-deep",
  danger: "text-danger-deep",
  success: "text-success-deep",
};

const toneClass = computed(() => TONES[props.tone] ?? TONES.warning);
const headClass = computed(() => HEAD_TONES[props.tone] ?? HEAD_TONES.warning);
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3.5 border rounded-adm-md"
    :class="toneClass"
  >
    <HeroCore
      :path="icon"
      class="size-[1.125rem] shrink-0 mt-px"
      :class="headClass"
    />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="font-bold text-adm-base" :class="headClass">
        {{ title }}
      </p>
      <!-- Cuerpo en el gris de texto normal (`ink2`), no en el tono del aviso. -->
      <div
        class="text-adm-sm leading-relaxed text-secondary-500"
        :class="title ? 'mt-1' : ''"
      >
        <slot />
      </div>
    </div>
    <div class="shrink-0"><slot name="action" /></div>
  </div>
</template>
