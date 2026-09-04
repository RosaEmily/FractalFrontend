<script setup lang="ts">
import AulaBar from "./aula-bar.vue";

/**
 * Esqueleto de carga.
 *
 * Mientras el servicio responde se muestra la FORMA de lo que va a llegar, no
 * un spinner suelto: el ojo ya sabe dónde mirar cuando aparecen los datos, y
 * la pantalla no salta de alto al reemplazarse.
 *
 *  - `cards`  → la fila de indicadores
 *  - `table`  → un listado
 *  - `panel`  → una tarjeta suelta (un detalle, un resumen)
 *  - `page`   → pantalla completa: cabecera + indicadores + listado
 */
withDefaults(
  defineProps<{
    kind?: "page" | "cards" | "table" | "panel";
    /** Filas de la tabla. Conviene aproximar lo que suele venir. */
    rows?: number;
    cards?: number;
  }>(),
  { kind: "page", rows: 6, cards: 4 },
);

/** Anchos alternados: un bloque de barras idénticas se lee como un patrón. */
const rowWidth = (index: number) => `${58 - (index % 3) * 9}%`;
</script>

<template>
  <div role="status" aria-busy="true" aria-live="polite">
    <span class="sr-only">Cargando…</span>

    <!-- Indicadores -->
    <div
      v-if="kind === 'cards'"
      class="grid gap-4"
      style="grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr))"
    >
      <div
        v-for="card in cards"
        :key="card"
        class="bg-surface-paper border border-line rounded-adm-lg p-5"
      >
        <AulaBar :w="56" :h="9" />
        <AulaBar w="58%" :h="26" class="mt-3.5" />
        <AulaBar w="75%" :h="9" class="mt-3" />
      </div>
    </div>

    <!-- Listado -->
    <div
      v-else-if="kind === 'table'"
      class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden"
    >
      <div class="flex gap-5 px-5 py-3.5 bg-admin-bg border-b border-line">
        <AulaBar :w="90" :h="9" />
        <AulaBar :w="150" :h="9" />
        <AulaBar :w="70" :h="9" />
      </div>
      <div
        v-for="(row, index) in rows"
        :key="row"
        class="flex items-center gap-5 px-5 py-4.5"
        :class="index ? 'border-t border-line-soft' : ''"
      >
        <AulaBar :w="38" :h="38" :r="10" />
        <span class="flex-1 min-w-0">
          <AulaBar :w="rowWidth(index)" :h="13" />
          <AulaBar w="38%" :h="9" class="mt-2.5" />
        </span>
        <AulaBar :w="92" :h="11" />
        <AulaBar :w="64" :h="20" :r="99" />
      </div>
    </div>

    <!-- Tarjeta suelta -->
    <div
      v-else-if="kind === 'panel'"
      class="bg-surface-paper border border-line rounded-adm-lg p-6"
    >
      <AulaBar :w="110" :h="9" />
      <AulaBar w="48%" :h="34" class="mt-4" />
      <AulaBar w="90%" :h="11" class="mt-4.5" />
      <AulaBar w="72%" :h="11" class="mt-2.5" />
    </div>

    <!-- Pantalla completa -->
    <template v-else>
      <AulaBar :w="120" :h="9" />
      <AulaBar w="46%" :h="34" class="mt-3.5" />
      <AulaBar w="64%" :h="12" class="mt-3.5" />

      <div class="h-6.5" />
      <AulaSkeleton kind="cards" />
      <div class="h-6" />
      <AulaSkeleton kind="table" :rows="rows" />
    </template>
  </div>
</template>
