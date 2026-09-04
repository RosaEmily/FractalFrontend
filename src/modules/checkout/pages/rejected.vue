<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CheckoutLayout from "../layouts/main.vue";
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const methodId = route.query.method as string | undefined;

/*
 * El motivo real, cuando la API lo dio. Los tres genéricos de abajo se muestran
 * igual: cubren lo que una pasarela devolvería sin detalle, y le dan al usuario
 * algo que revisar en vez de un "error" a secas.
 */
const reason = route.query.reason as string | undefined;

const REASONS = [
  "Fondos insuficientes o límite excedido",
  "Datos de la tarjeta incorrectos",
  "Tu banco bloqueó la operación por seguridad",
];

/** Reintentar vuelve al mismo método; el carrito sigue intacto. */
const retry = () =>
  methodId
    ? router.push({ name: "checkout-pay", query: { method: methodId } })
    : router.push({ name: "checkout-method" });

/*
 * Sin carrito no hay importe que reintentar: se llegó aquí con la compra ya
 * resuelta o por URL directa. Mostrar «Reintentar — S/ 0.00» sería peor que no
 * mostrar el importe.
 */
const amount = computed(() => cart.totals?.total ?? cart.localTotal);
const hasCart = computed(() => !cart.isEmpty && amount.value > 0);
</script>

<template>
  <CheckoutLayout step="rejected" :show-steps="false">
    <div class="mx-auto max-w-140 py-2">
      <div class="rounded-adm-lg border border-line bg-surface-paper p-7 text-center shadow-lg sm:p-10">
        <div class="mx-auto mb-[1.375rem] grid size-20 place-items-center rounded-pill border-2 border-accent-tint bg-accent-soft">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-primary-500" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          </svg>
        </div>

        <p class="font-mono text-[0.688rem] font-semibold tracking-[0.12em] text-primary-600 uppercase">
          Pago no completado
        </p>
        <h1 class="mt-3.5 font-display text-[2.125rem] font-bold tracking-tight text-secondary-900">
          No pudimos procesar tu pago.
        </h1>
        <p class="mx-auto mt-3.5 max-w-105 text-[0.969rem] leading-relaxed text-secondary-500">
          <template v-if="reason">{{ reason }}</template>
          <template v-else>
            El pago no pudo completarse y <strong class="text-secondary-900">no se realizó ningún cargo</strong>.
            Verifica los datos o prueba con otro método.
          </template>
        </p>

        <div class="my-6 rounded-adm-md border border-line bg-surface-page p-[1.125rem] text-left">
          <p class="mb-3 font-mono text-[0.688rem] tracking-[0.12em] text-secondary-400 uppercase">
            Posibles motivos
          </p>
          <ul class="flex flex-col gap-2.5">
            <li
              v-for="item in REASONS"
              :key="item"
              class="flex items-center gap-2.5 text-[0.844rem] text-secondary-500"
            >
              <span class="size-[0.313rem] shrink-0 rounded-pill bg-primary-500" />
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="flex flex-col gap-2.5">
          <!-- El carrito no se vació: reintentar debe costar lo mismo. -->
          <LandingButton variant="primary" size="lg" class="w-full justify-center" @click="retry">
            <template v-if="hasCart">Reintentar el pago — {{ formatMoney(amount) }}</template>
            <template v-else>Reintentar el pago</template>
          </LandingButton>
          <LandingButton
            variant="secondary"
            size="md"
            :arrow="false"
            class="w-full justify-center"
            @click="router.push({ name: 'checkout-method' })"
          >
            Usar otro método de pago
          </LandingButton>
        </div>

        <p class="mt-5 inline-flex items-center gap-2 text-[0.813rem] text-secondary-500">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="text-success-DEFAULT" aria-hidden="true">
            <path d="M11.5 2C6.261 2 2 6.261 2 11.5c0 1.852.537 3.576 1.459 5.033L2 22l5.612-1.437A9.5 9.5 0 0011.5 21c5.239 0 9.5-4.261 9.5-9.5S16.739 2 11.5 2z" />
          </svg>
          ¿Sigues con problemas?
          <a
            href="https://wa.me/51987654321"
            target="_blank"
            rel="noopener"
            class="font-semibold text-primary-600 underline"
          >Escríbenos por WhatsApp</a>
        </p>
      </div>
    </div>
  </CheckoutLayout>
</template>
