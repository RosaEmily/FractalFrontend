<script setup lang="ts">
import { mdiChartBoxOutline } from "@mdi/js";
import { EmptyStateUi } from "@/shared/components";

defineProps<{
  title: string;
  count?: number;
  /** Primera carga: dibuja el esqueleto. */
  loading?: boolean;
  /** Recarga con filtros: deja el contenido anterior, atenuado, sin mover la página. */
  refreshing?: boolean;
  empty?: boolean;
  /** Título y ayuda del estado vacío; por defecto los de un reporte con rango de fechas. */
  emptyTitle?: string;
  emptyText?: string;
  emptyIcon?: string;
  /** `success` cuando vacío es buena noticia (nada pendiente). */
  emptyTone?: "neutral" | "success";
}>();
</script>

<template>
  <div>
    <!--
      Los filtros mandan sobre TODO el reporte (tarjetas, resumen, gráficos y
      tabla), así que van en su propia barra arriba y no dentro de la tabla.
    -->
    <div
      v-if="$slots.filters"
      class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm mb-3.5 [&>div]:border-b-0"
    >
      <slot name="filters" />
    </div>

    <div
      class="transition-opacity duration-150"
      :class="refreshing ? 'opacity-60 pointer-events-none' : ''"
      :aria-busy="refreshing || undefined"
    >
    <!-- Tarjetas de totales -->
    <slot name="totals" />

    <!-- Secciones propias del reporte (gráficos, desgloses) antes de la tabla -->
    <slot name="extra" />

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

      <!-- Esqueleto con forma de tabla: el bloque no cambia de alto al llegar los datos. -->
      <div v-if="loading" aria-busy="true" aria-label="Cargando reporte">
        <div
          v-for="n in 6"
          :key="n"
          class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-5.5 py-3.5 border-t border-line-soft"
        >
          <span class="adm-skeleton block h-3.5 w-3/4 rounded-[0.313rem]" />
          <span class="adm-skeleton block h-3.5 w-1/2 rounded-[0.313rem] ml-auto" />
          <span class="adm-skeleton block h-3.5 w-2/3 rounded-[0.313rem] ml-auto" />
          <span class="adm-skeleton block h-3.5 w-2/3 rounded-[0.313rem] ml-auto" />
          <span class="adm-skeleton block h-3.5 w-full rounded-pill" />
        </div>
      </div>

      <EmptyStateUi
        v-else-if="empty"
        :title="emptyTitle ?? 'Sin resultados'"
        :description="emptyText ?? 'No hay datos para el periodo seleccionado. Prueba con otro rango de fechas.'"
        :icon="emptyIcon ?? mdiChartBoxOutline"
        :tone="emptyTone ?? 'neutral'"
        class="border-t border-line-soft"
      />

      <!-- La tabla scrollea sola: son muchas columnas y el layout no debe
           romperse horizontalmente en pantallas chicas. -->
      <div v-else class="overflow-x-auto pb-5">
        <slot />
      </div>
    </div>
  </div>
  </div>
</template>
