<script setup lang="ts">
import { computed } from "vue";

/**
 * Celda de identidad del diseño: avatar con iniciales (no depende de que
 * exista foto), nombre en negrita y una línea secundaria opcional.
 */
interface Props {
  name: string;
  /** Segunda línea: correo, prefijo, etc. */
  secondary?: string | null;
  /** Si la línea secundaria va en mono (prefijos, correos). */
  mono?: boolean;
  photo?: string | null;
}

const props = withDefaults(defineProps<Props>(), { mono: true });

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase(),
);
</script>

<template>
  <div class="flex items-center gap-2.5">
    <img
      v-if="photo"
      :src="photo"
      alt=""
      class="size-8 rounded-full object-cover shrink-0"
    />
    <span
      v-else
      class="size-8 rounded-full bg-accent-soft text-primary-600 inline-flex items-center justify-center shrink-0 font-display text-adm-sm font-bold"
    >
      {{ initials }}
    </span>

    <div class="min-w-0">
      <div class="text-adm-base font-bold text-secondary-900 truncate">
        {{ name }}
      </div>
      <div
        v-if="secondary"
        class="text-adm-xs text-secondary-400 truncate mt-0.5"
        :class="mono ? 'font-mono' : ''"
      >
        {{ secondary }}
      </div>
    </div>
  </div>
</template>
