<script setup lang="ts">
/**
 * Esqueleto de carga de un formulario de edición.
 *
 * Misma regla que el listado ([[table-skeleton]]): se muestra la FORMA de lo
 * que va a llegar, no un spinner. Antes el `edit.vue` levantaba el overlay
 * global (`useLoadingStore`) y el formulario se pintaba VACÍO debajo; al
 * resolverse el `edit()` los campos se rellenaban de golpe y el layout saltaba.
 *
 * Cada fila es label + control, que es la forma real de `AdmField`.
 */
interface Props {
  /** Cuántos campos aproximar. De menos, el salto se nota al llenarse. */
  fields?: number;
  /** Un textarea al final: casi todos los formularios del admin lo tienen. */
  textarea?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fields: 2,
  textarea: false,
});

/*
 * Anchos desiguales a propósito, como en el listado: con todos los labels al
 * mismo ancho el bloque parece un placeholder plano y no un formulario.
 */
const labelWidth = (index: number) => `${22 + ((index * 17) % 26)}%`;
</script>

<template>
  <div class="space-y-4" aria-hidden="true">
    <div v-for="field in props.fields" :key="field" class="space-y-2">
      <span
        class="adm-skeleton block rounded-[0.313rem]"
        :style="{ width: labelWidth(field), height: '12px' }"
      />
      <span class="adm-skeleton block h-10 w-full rounded-adm-sm" />
    </div>

    <div v-if="props.textarea" class="space-y-2">
      <span
        class="adm-skeleton block rounded-[0.313rem]"
        :style="{ width: '30%', height: '12px' }"
      />
      <span class="adm-skeleton block h-24 w-full rounded-adm-sm" />
    </div>
  </div>
</template>
