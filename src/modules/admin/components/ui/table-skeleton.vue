<script setup lang="ts">
/**
 * Esqueleto de carga de un listado (`AdmTableSkeleton` del diseño).
 *
 * Se muestra la FORMA de lo que va a llegar, no un spinner: el ojo ya sabe
 * dónde mirar y la tabla no salta de alto al reemplazarse por los datos.
 *
 * Reusa el mismo `grid-template-columns` que la tabla real para que las barras
 * caigan bajo su columna; si no, el esqueleto y el resultado no coinciden y el
 * salto se nota más que sin esqueleto.
 */
interface Props {
  /** Anchos de columna, en el mismo orden que la tabla. */
  columns: string[];
  /** Aproximar las filas que van a llegar: 6 donde caben 30 se nota. */
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), { rows: 6 });

/** La columna del checkbox es un cuadrado, no una barra de texto. */
const isCheckbox = (width: string) => width === "36px";

/*
 * Anchos desiguales a propósito: con todas las barras al 100% el bloque parece
 * un placeholder plano en vez de filas de datos. La fórmula es la del diseño.
 */
const barWidth = (width: string, index: number) =>
  isCheckbox(width) ? "18px" : `${40 + ((index * 13) % 40)}%`;
</script>

<template>
  <div
    v-for="row in props.rows"
    :key="row"
    class="grid items-center gap-3 px-[1.125rem] py-3.5"
    :class="row === props.rows ? '' : 'border-b border-line-soft'"
    :style="{ gridTemplateColumns: props.columns.join(' ') }"
  >
    <span
      v-for="(width, index) in props.columns"
      :key="index"
      class="adm-skeleton block rounded-[0.313rem]"
      :style="{
        width: barWidth(width, index),
        height: isCheckbox(width) ? '18px' : '13px',
      }"
    />
  </div>
</template>
