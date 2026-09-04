<script setup lang="ts">
import { computed } from "vue";

/**
 * QR decorativo, determinista.
 *
 * ⚠️ **No codifica nada.** Ninguna billetera está integrada, así que un QR real
 * exigiría que la pasarela lo emitiera. Este dibujo mantiene la pantalla fiel al
 * diseño sin fingir que hay un cobro detrás: el aviso de la pantalla lo dice.
 */
const SIZE = 17;

const cells = computed(() => {
  const out: { x: number; y: number }[] = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Las tres esquinas llevan el patrón de posicionamiento de un QR real.
      const corner =
        (x < 5 && y < 5) ||
        (x >= SIZE - 5 && y < 5) ||
        (x < 5 && y >= SIZE - 5);

      const on = corner
        ? x === 0 ||
          x === 4 ||
          y === 0 ||
          y === 4 ||
          (x >= 1 && x <= 3 && y >= 1 && y <= 3)
        : (x * 7 + y * 13 + x * y) % 3 === 0;

      if (on) out.push({ x, y });
    }
  }

  return out;
});
</script>

<template>
  <svg
    viewBox="0 0 17 17"
    width="100%"
    height="100%"
    shape-rendering="crispEdges"
    role="img"
    aria-label="Código QR de pago"
  >
    <rect
      v-for="cell in cells"
      :key="`${cell.x}-${cell.y}`"
      :x="cell.x"
      :y="cell.y"
      width="1"
      height="1"
      class="fill-secondary-900"
    />
  </svg>
</template>
