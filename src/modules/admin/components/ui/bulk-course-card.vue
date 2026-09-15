<script setup lang="ts">
/**
 * Tarjeta de un curso dentro de un formulario de alta masiva.
 *
 * Es el contenedor que el diseño repite en los 4 modos masivos: cabecera con
 * el nombre del curso + un dato a la derecha (horario, suma de pesos,
 * aprobados) y el cuerpo con los campos. Mismo estilo que `OfertaCursosTable`
 * de Programas.
 */
defineProps<{
  /** Nombre del curso, en la cabecera. */
  title: string;
  /** Dato secundario a la derecha, en mono (horario, "3 aprobados", etc.). */
  meta?: string | null;
  /** Atenúa la tarjeta cuando está excluida. */
  muted?: boolean;
}>();
</script>

<template>
  <div
    class="overflow-hidden rounded-adm-sm border-[1.5px] border-control-border transition-opacity"
    :class="{ 'opacity-45': muted }"
  >
    <div
      class="flex items-center gap-3 border-b border-control-border bg-admin-bg px-3.5 py-2.5"
    >
      <span class="flex-1 text-[0.845rem] font-bold text-secondary-900">
        {{ title }}
      </span>
      <span v-if="meta" class="font-mono text-[0.6875rem] text-secondary-400">
        {{ meta }}
      </span>
      <!-- Acción de la cabecera: quitar / restaurar la tarjeta. -->
      <slot name="action" />
    </div>

    <div class="p-3">
      <slot />
    </div>
  </div>
</template>
