<script setup lang="ts">
/**
 * Marco de vista previa: pinta un bloque REAL de la landing a su ancho de
 * escritorio y lo escala para que quepa en el formulario. Así no se mantiene
 * una copia del diseño en el panel (que se desactualiza): lo que se ve es el
 * mismo componente que se publica, con los datos del borrador.
 *
 * Es solo para mirar: sin clics, sin foco ni lectores de pantalla (`inert`).
 * El contenido responde al ancho de la ventana (media queries), no al del marco.
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(defineProps<{ width?: number }>(), { width: 1280 });

const outer = ref<HTMLElement | null>(null);
const inner = ref<HTMLElement | null>(null);
const scale = ref(1);
/** Ancho real del marco: si sobra espacio, el contenido lo ocupa entero (sin franja vacía). */
const frameWidth = ref(props.width);
const innerHeight = ref(0);
let observer: ResizeObserver | null = null;

const measure = () => {
  if (!outer.value || !inner.value) return;
  const available = outer.value.clientWidth;
  scale.value = Math.min(1, available / props.width);
  frameWidth.value = scale.value < 1 ? props.width : available;
  innerHeight.value = inner.value.offsetHeight;
};

onMounted(() => {
  observer = new ResizeObserver(measure);
  if (outer.value) observer.observe(outer.value);
  if (inner.value) observer.observe(inner.value);
  measure();
});
onBeforeUnmount(() => observer?.disconnect());

const frameStyle = computed(() => ({ height: `${innerHeight.value * scale.value}px` }));
const innerStyle = computed(() => ({
  width: `${frameWidth.value}px`,
  transform: `scale(${scale.value})`,
}));
</script>

<template>
  <div
    ref="outer"
    class="w-full overflow-hidden rounded-adm-sm border border-line bg-surface-page"
    :style="frameStyle"
    aria-hidden="true"
  >
    <div ref="inner" class="origin-top-left pointer-events-none select-none" :style="innerStyle" inert>
      <slot />
    </div>
  </div>
</template>
