<script setup lang="ts">
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

withDefaults(
  defineProps<{
    cta?: string;
    ctaDisabled?: boolean;
    loading?: boolean;
    footnote?: boolean;
  }>(),
  { cta: "", ctaDisabled: false, loading: false, footnote: true },
);

defineEmits<{ cta: [] }>();

const cart = useCartStore();
</script>

<template>
  <div class="rounded-adm-lg border border-line bg-surface-paper p-6 shadow-sm">
    <p class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
      Resumen
    </p>

    <dl class="mt-4 space-y-2.5 text-[0.906rem]">
      <div class="flex items-baseline justify-between gap-4">
        <dt class="text-secondary-500">
          {{ cart.count }} {{ cart.count === 1 ? "programa" : "programas" }}
        </dt>
        <dd class="font-semibold text-secondary-900">
          {{ formatMoney(cart.totals?.subtotal ?? cart.localTotal) }}
        </dd>
      </div>

      <!--
        El IGV va desglosado pero NO se suma: el precio mostrado ya lo incluye.
        Presentarlo como línea aparte sugeriría que se añade al total.
      -->
      <div
        v-if="cart.totals"
        class="flex items-baseline justify-between gap-4 text-[0.813rem] text-secondary-400"
      >
        <dt>
          Incluye IGV ({{ Math.round(cart.totals.igv_rate * 100) }}%)
        </dt>
        <dd>{{ formatMoney(cart.totals.igv) }}</dd>
      </div>
    </dl>

    <div class="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
      <span class="font-display text-base font-bold text-secondary-900">Total</span>
      <span class="font-display text-2xl font-bold text-secondary-900">
        {{ formatMoney(cart.totals?.total ?? cart.localTotal) }}
      </span>
    </div>

    <LandingButton
      v-if="cta"
      variant="primary"
      size="lg"
      class="mt-5 w-full justify-center"
      :class="ctaDisabled || loading ? 'pointer-events-none opacity-55' : ''"
      @click="$emit('cta')"
    >
      {{ loading ? "Procesando…" : cta }}
    </LandingButton>

    <p
      v-if="footnote"
      class="mt-3.5 flex items-start gap-2 text-[0.75rem] leading-relaxed text-secondary-400"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        class="mt-0.5 shrink-0 text-success-DEFAULT"
        aria-hidden="true"
      >
        <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" />
        <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Pago protegido. Garantía de 7 días desde el inicio del programa.</span>
    </p>
  </div>
</template>
