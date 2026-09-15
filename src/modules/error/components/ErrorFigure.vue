<script setup lang="ts">
import { computed } from "vue";
import type { ErrorIcon, ErrorTone } from "../constants/codes";

/**
 * Badge circular con icono de línea. Mismo trazo que el resto del sistema:
 * sin relleno decorativo, solo contorno.
 */
const props = defineProps<{ tone: ErrorTone; icon: ErrorIcon }>();

const ring = computed(() =>
  props.tone === "danger"
    ? "text-danger-DEFAULT"
    : props.tone === "accent"
      ? "text-primary-500"
      : "text-secondary-500",
);

const halo = computed(() =>
  props.tone === "danger"
    ? "bg-danger-soft"
    : props.tone === "accent"
      ? "bg-accent-soft"
      : "bg-surface-sand",
);

/** Trazos de los iconos que no son formas cerradas simples. */
const PATHS: Partial<Record<ErrorIcon, string[]>> = {
  warning: ["M12 3L4 20H20Z", "M12 9V13.5", "M12 16.3V16.4"],
  method: ["M4 6H20", "M4 12H20", "M4 18H12", "M17 15L20 18L17 21"],
  conflict: ["M8 4V13A4 4 0 0 0 12 17H16", "M16 17L13 14", "M16 17L13 20", "M16 7H8"],
  trash: [
    "M5 7H19",
    "M9 7V5A2 2 0 0 1 11 3H13A2 2 0 0 1 15 5V7",
    "M7 7V19A2 2 0 0 0 9 21H15A2 2 0 0 0 17 19V7",
    "M10 11V17",
    "M14 11V17",
  ],
};
</script>

<template>
  <div class="relative mx-auto size-21">
    <div class="absolute inset-0 rounded-pill" :class="halo" />
    <!-- Anillo interior tenue: da profundidad sin competir con el icono. -->
    <div class="absolute inset-2 rounded-pill border-[1.5px] opacity-22" :class="ring" />

    <div class="absolute inset-0 flex items-center justify-center" :class="ring">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <template v-if="icon === 'lock'">
          <rect x="4.5" y="10" width="15" height="10" rx="2.2" />
          <path d="M7.5 10V7A4.5 4.5 0 0 1 16.5 7V10" />
          <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
        </template>

        <template v-else-if="icon === 'search'">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20L15.2 15.2" />
        </template>

        <template v-else-if="icon === 'clock'">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12L15.5 14" />
        </template>

        <template v-else-if="icon === 'server'">
          <rect x="4" y="4" width="16" height="6.5" rx="1.6" />
          <rect x="4" y="13.5" width="16" height="6.5" rx="1.6" />
          <circle cx="8" cy="7.25" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="16.75" r="0.9" fill="currentColor" stroke="none" />
        </template>

        <template v-else>
          <path v-for="(d, i) in PATHS[icon] ?? []" :key="i" :d="d" />
        </template>
      </svg>
    </div>
  </div>
</template>
