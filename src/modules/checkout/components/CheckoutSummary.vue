<script setup lang="ts">
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

withDefaults(
  defineProps<{
    footnote?: boolean;
    dense?: boolean;
  }>(),
  { footnote: true, dense: false },
);

const cart = useCartStore();
</script>

<template>
  <!-- `dense` va DENTRO de otra tarjeta (el pedido de los pasos): sin marco ni cabecera. -->
  <div :class="dense ? '' : 'rounded-adm-lg border border-line bg-surface-paper p-7 shadow-md'">
    <div v-if="!dense" class="mb-4 flex items-center justify-between gap-3">
      <p class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
        Resumen del pedido
      </p>
      <span
        class="rounded-pill bg-accent-soft px-2.5 py-1 font-mono text-[0.688rem] font-bold tracking-[0.06em] text-primary-600 uppercase"
      >
        {{ cart.count }} {{ cart.count === 1 ? "ítem" : "ítems" }}
      </span>
    </div>

    <div class="flex items-baseline justify-between gap-4 border-t border-line pt-4">
      <span class="text-base font-bold text-secondary-500">Total a pagar</span>
      <span class="font-display text-[1.875rem] font-extrabold tracking-[-0.02em] text-secondary-900">
        {{ formatMoney(cart.totals?.total ?? cart.localTotal) }}
      </span>
    </div>

    <p
      v-if="footnote"
      class="mt-4 flex items-center justify-center gap-2 text-[0.781rem] text-secondary-400"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        class="shrink-0 text-success-DEFAULT"
        aria-hidden="true"
      >
        <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" />
        <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Pago protegido · datos cifrados</span>
    </p>
  </div>
</template>
