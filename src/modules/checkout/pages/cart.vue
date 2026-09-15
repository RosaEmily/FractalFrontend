<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CartItemRow from "../components/CartItemRow.vue";
import CheckoutSummary from "../components/CheckoutSummary.vue";
import CheckoutLayout from "../layouts/main.vue";
import { useCartStore } from "../stores/useCartStore";

const cart = useCartStore();
const router = useRouter();

/*
 * Se revalida al entrar, no solo al pagar: el carrito sobrevive en
 * `localStorage`, así que puede traer un programa cuyo cupo se llenó hace días.
 * Enterarse al final del flujo sería peor.
 */
onMounted(() => {
  if (!cart.isEmpty) cart.validate();
});

const goNext = () => router.push({ name: "checkout-auth" });
</script>

<template>
  <CheckoutLayout step="cart">
    <!-- ── Carrito vacío ─────────────────────────────────────────────── -->
    <div v-if="cart.isEmpty" class="mx-auto max-w-md py-10 text-center">
      <div class="mx-auto grid size-16 place-items-center rounded-pill bg-surface-cream">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-secondary-400" aria-hidden="true">
          <path d="M3 4h2.2l2.1 10.4a1.6 1.6 0 0 0 1.6 1.3h7.8a1.6 1.6 0 0 0 1.6-1.25L20 8H6.2"
            stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="9.5" cy="19" r="1.4" fill="currentColor" />
          <circle cx="17" cy="19" r="1.4" fill="currentColor" />
        </svg>
      </div>
      <h1 class="mt-5 font-display text-2xl font-bold text-secondary-900">
        Tu carrito está vacío
      </h1>
      <p class="mt-2.5 text-[0.906rem] leading-relaxed text-secondary-500">
        Explora los programas disponibles y agrega el que quieras cursar.
      </p>
      <LandingButton
        variant="primary"
        size="lg"
        class="mt-6 w-full justify-center"
        @click="router.push({ name: 'programs' })"
      >
        Ver programas
      </LandingButton>
    </div>

    <!-- ── Carrito con ítems (layout A: lista + resumen lateral) ─────── -->
    <div v-else class="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <section>
        <p class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
          Paso 1 de 4
        </p>
        <h1 class="mt-1.5 font-display text-3xl font-bold tracking-tight text-secondary-900">
          Tu carrito
        </h1>
        <p class="mt-2 text-[0.906rem] text-secondary-500">
          Revisa los programas antes de continuar.
        </p>

        <!-- Los problemas sin línea concreta (moneda mixta) van arriba: no
             pertenecen a ningún ítem en particular. -->
        <div
          v-for="problem in cart.globalProblems"
          :key="problem.code"
          class="mt-5 rounded-adm-md border border-danger-DEFAULT/40 bg-danger-soft px-4 py-3 text-[0.875rem] text-danger-DEFAULT"
        >
          {{ problem.message }}
        </div>

        <div class="mt-6 space-y-3.5">
          <CartItemRow
            v-for="item in cart.items"
            :key="item.offerId"
            :item="item"
            :problem="cart.problemOf(item.offerId)"
            @remove="cart.remove"
          />
        </div>
      </section>

      <aside class="lg:sticky lg:top-28">
        <CheckoutSummary
          cta="Continuar"
          :cta-disabled="cart.validating || cart.problems.length > 0"
          :loading="cart.validating"
          @cta="goNext"
        />
      </aside>
    </div>
  </CheckoutLayout>
</template>
