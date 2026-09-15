<script setup lang="ts">
/**
 * Celda de dos líneas del diseño (sin avatar): principal en negrita y una
 * secundaria más chica. Se usa en Programas (nombre + prefijo), Líneas
 * (nombre + descripción) y Contacto (correo + teléfono).
 */
interface Props {
  primary: string;
  secondary?: string | null;
  /** La segunda línea en mono: prefijos, teléfonos, documentos. */
  mono?: boolean;
  /** Cuando la primera línea no debe ir en negrita (ej. Contacto). */
  plain?: boolean;
}

withDefaults(defineProps<Props>(), { mono: true, plain: false });
</script>

<template>
  <div class="min-w-0">
    <div
      class="truncate"
      :class="
        plain
          ? 'text-adm-sm text-secondary-900'
          : 'text-adm-base font-bold text-secondary-900'
      "
    >
      {{ primary }}
    </div>
    <div
      v-if="secondary"
      class="text-adm-xs text-secondary-400 truncate mt-0.5"
      :class="mono ? 'font-mono' : ''"
    >
      {{ secondary }}
    </div>
  </div>
</template>
