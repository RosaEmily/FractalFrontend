<script setup lang="ts">
/**
 * Paginación del admin (`AdmPagination` del diseño re-extraído 14-sep).
 *
 * Reemplaza al `Paginator` de PrimeVue porque el diseño pide cosas que su
 * template no arma: **números de página con elipsis** (lo más útil: antes, ir
 * de la página 1 a la 8 exigía 7 clics en la flecha), el contador en formato
 * `1–10 de 47` y el selector etiquetado "Filas por página".
 *
 * Tres bloques: contador · navegación · filas por página.
 */
import { computed } from "vue";
import { HeroCore, SelectCore } from "@/shared/components";
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
} from "@mdi/js";

const props = withDefaults(
  defineProps<{
    total: number;
    /** Página actual, base 1. */
    page: number;
    rows: number;
    rowsPerPageOptions?: number[];
  }>(),
  { rowsPerPageOptions: () => [5, 10, 25, 50] },
);

const emit = defineEmits<{
  (e: "update:page", page: number): void;
  (e: "update:rows", rows: number): void;
}>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.rows)),
);

/*
 * La página se acota al total: si el padre tarda un tick en resetearla —o se
 * queda desincronizada— el contador mostraría un rango que no existe
 * (`301–127 de 127`) en vez de la última página real.
 */
const safePage = computed(() =>
  Math.min(Math.max(1, props.page), totalPages.value),
);

const from = computed(() =>
  props.total === 0 ? 0 : (safePage.value - 1) * props.rows + 1,
);
const to = computed(() => Math.min(props.total, safePage.value * props.rows));

/**
 * Ventana de números: hasta 7 se listan todos; a partir de ahí se muestran la
 * primera, la última y las vecinas de la actual, con elipsis en los huecos.
 * (Misma regla que el diseño.)
 */
const pages = computed<(number | "…")[]>(() => {
  const last = totalPages.value;
  const current = safePage.value;

  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  if (current > 3) items.push("…");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(last - 1, current + 1);
    i++
  ) {
    items.push(i);
  }

  if (current < last - 2) items.push("…");
  items.push(last);

  return items;
});

const go = (page: number) => {
  const target = Math.min(totalPages.value, Math.max(1, page));
  if (target !== safePage.value) emit("update:page", target);
};

/** Opciones en el shape que espera `SelectCore` (label/value). */
const rowsOptions = computed(() =>
  props.rowsPerPageOptions.map((value) => ({ label: String(value), value })),
);

/**
 * Cambiar el tamaño vuelve a la página 1: la actual puede no existir ya.
 *
 * Se emite también `update:page` por si el padre solo escucha `update:rows`:
 * sin eso, quedarse en la página 8 con 25 filas daba un contador imposible
 * (`301–127 de 127`).
 */
const changeRows = (value: unknown) => {
  if (props.page !== 1) emit("update:page", 1);
  emit("update:rows", Number(value));
};
</script>

<template>
  <div class="adm-pagination">
    <span class="adm-pagination__count">
      {{ total === 0 ? "Sin registros" : `${from}–${to} de ${total}` }}
    </span>

    <div class="adm-pagination__nav">
      <button
        type="button"
        class="adm-pg-btn"
        :disabled="safePage === 1"
        title="Primera página"
        aria-label="Primera página"
        @click="go(1)"
      >
        <HeroCore :path="mdiChevronDoubleLeft" size="15" />
      </button>
      <button
        type="button"
        class="adm-pg-btn"
        :disabled="safePage === 1"
        title="Anterior"
        aria-label="Página anterior"
        @click="go(safePage - 1)"
      >
        <HeroCore :path="mdiChevronLeft" size="15" />
      </button>

      <template v-for="(item, index) in pages" :key="`${item}-${index}`">
        <span v-if="item === '…'" class="adm-pagination__gap">…</span>
        <button
          v-else
          type="button"
          class="adm-pg-btn adm-pg-btn--num"
          :class="{ 'is-current': item === safePage }"
          :aria-current="item === safePage ? 'page' : undefined"
          @click="go(item as number)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="adm-pg-btn"
        :disabled="safePage === totalPages"
        title="Siguiente"
        aria-label="Página siguiente"
        @click="go(safePage + 1)"
      >
        <HeroCore :path="mdiChevronRight" size="15" />
      </button>
      <button
        type="button"
        class="adm-pg-btn"
        :disabled="safePage === totalPages"
        title="Última página"
        aria-label="Última página"
        @click="go(totalPages)"
      >
        <HeroCore :path="mdiChevronDoubleRight" size="15" />
      </button>
    </div>

    <div class="adm-pagination__rows">
      <span class="adm-pagination__count">Filas por página</span>
      <!--
        `SelectCore` (PrimeVue) y no un `<select>` nativo: el proyecto usa los
        componentes de PrimeVue en todos los controles, y así este hereda el
        preset de Fractal en vez de pintarse con el estilo del sistema.
      -->
      <SelectCore
        :model-value="rows"
        :options="rowsOptions"
        option-label="label"
        option-value="value"
        class="adm-pagination__select"
        @update:model-value="changeRows"
      />
    </div>
  </div>
</template>
