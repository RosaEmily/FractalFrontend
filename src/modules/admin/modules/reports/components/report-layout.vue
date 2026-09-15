<script setup lang="ts">
defineProps<{
  title: string;
  count?: number;
  loading?: boolean;
  empty?: boolean;
}>();
</script>

<template>
  <div>
    <!-- Tarjetas de totales -->
    <slot name="totals" />

    <div
      class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm"
    >
      <header class="px-5.5 py-4 flex items-center gap-3">
        <h2
          class="font-display text-adm-xl font-bold text-secondary-900 tracking-tight"
        >
          {{ title }}
        </h2>
        <span
          v-if="count !== undefined"
          class="font-mono text-adm-label text-secondary-400 bg-admin-bg px-2 py-0.5 rounded-pill"
        >
          {{ count }}
        </span>
      </header>

      <!-- Barra de filtros -->
      <slot name="filters" />

      <div v-if="loading" class="px-5.5 py-10 text-adm-base text-secondary-400">
        Cargando…
      </div>

      <div
        v-else-if="empty"
        class="px-5.5 py-10 text-center text-adm-base text-secondary-500"
      >
        No hay datos para el periodo seleccionado.
      </div>

      <!-- La tabla scrollea sola: son muchas columnas y el layout no debe
           romperse horizontalmente en pantallas chicas. -->
      <div v-else class="overflow-x-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
