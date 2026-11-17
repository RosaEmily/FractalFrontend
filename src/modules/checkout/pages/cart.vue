<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { hasSession } from "@/shared/utils/session";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import LandingEyebrow from "@/modules/landing/components/ui/LandingEyebrow.vue";
import CartGuarantee from "../components/CartGuarantee.vue";
import CartItemRow from "../components/CartItemRow.vue";
import CartUpsell from "../components/CartUpsell.vue";
import CheckoutSummary from "../components/CheckoutSummary.vue";
import PayMark from "../components/PayMark.vue";
import CheckoutLayout from "../layouts/main.vue";
import { useCartStore } from "../stores/useCartStore";
import { useSiteContact } from "@/modules/landing/composables/useSiteContact";

const PAYMENT_BRANDS = ["visa", "mastercard", "amex", "diners"];

const cart = useCartStore();
const router = useRouter();

/*
 * Se revalida al entrar, no solo al pagar: el carrito sobrevive en
 * `localStorage`, así que puede traer un programa cuyo cupo se llenó hace días.
 * Enterarse al final del flujo sería peor.
 */
onMounted(async () => {
  if (cart.isEmpty) return;

  // Antes de validar, recuperar los ítems cuyo precio guardado quedó inservible
  // (ver `refreshStaleItems`): si no, el resumen muestra S/ 0.00.
  await cart.refreshStaleItems();
  await cart.validate();
});

/*
 * Agregar o quitar un programa cambia el carrito: hay que volver a pedir los
 * totales y los problemas (cupo, moneda) al servidor. Va acá y no en el store
 * porque `add()` también se usa desde la landing, donde aún no hay sesión.
 */
watch(
  () => cart.items.map((i) => i.offerId).join(","),
  () => {
    if (!cart.isEmpty) cart.validate();
  },
);

// Con sesión de aula no hay paso Cuenta: se va directo a los datos.
const goNext = () =>
  router.push({ name: hasSession("classroom") ? "checkout-buyer" : "checkout-auth" });

const { advisorHref } = useSiteContact();
const openAdvisor = () =>
  window.open(advisorHref("Hola, quiero información sobre los programas de Fractal"), "_blank", "noopener");
</script>

<style scoped>
.cart-empty-dots {
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-primary-500) 13%, transparent) 1.5px,
    transparent 1.5px
  );
  background-size: 16px 16px;
  mask: radial-gradient(circle, black 40%, transparent 72%);
}
</style>

<template>
  <CheckoutLayout
    step="cart"
    :primary="cart.isEmpty ? '' : 'Proceder al pago'"
    :primary-disabled="cart.validating || cart.problems.length > 0"
    :loading="cart.validating"
    @primary="goNext"
  >
    <!-- ── Carrito vacío ─────────────────────────────────────────────── -->
    <div v-if="cart.isEmpty" class="flex flex-1 flex-col items-center justify-center py-6 text-center sm:py-8">
      <div class="relative mb-3 grid size-50 place-items-center">
        <div class="absolute inset-0 rounded-pill bg-accent-soft opacity-70" />
        <div class="cart-empty-dots absolute inset-0 rounded-pill" />
        <svg width="92" height="92" viewBox="0 0 92 92" fill="none" class="relative text-primary-500" aria-hidden="true">
          <path d="M16 22H26L33 56H68L75 32H31" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="37" cy="70" r="5" fill="currentColor" />
          <circle cx="64" cy="70" r="5" fill="currentColor" />
          <path d="M52 38V48M47 43H57" class="stroke-surface-paper" stroke-width="2.6" stroke-linecap="round" />
        </svg>
      </div>
      <LandingEyebrow>Carrito vacío</LandingEyebrow>
      <h1 class="mt-4 font-display text-[2rem] font-bold tracking-[-0.02em] text-secondary-900 sm:text-[2.5rem]">
        Aún no agregas nada<span class="text-primary-500">.</span>
      </h1>
      <p class="mt-3.5 mb-7 max-w-110 text-base leading-[1.55] text-secondary-500">
        Explora nuestras líneas de carrera y cursos certificados por Autodesk. Puedes combinar varios en una sola compra.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <LandingButton variant="primary" size="lg" @click="router.push({ name: 'programs' })">
          Ver programas
        </LandingButton>
        <LandingButton variant="secondary" size="lg" :arrow="false" @click="openAdvisor">
          Hablar con un asesor
        </LandingButton>
      </div>
    </div>

    <!-- ── Carrito con ítems (layout A: lista + resumen lateral) ─────── -->
    <template v-else>
    <header class="mb-7">
      <LandingEyebrow :index="1">Tu carrito</LandingEyebrow>
      <h1
        class="mt-3.5 font-display text-[2.125rem] leading-[1.1] font-bold tracking-[-0.02em] text-secondary-900 sm:text-[2.875rem]"
      >
        Revisa tu compra<span class="text-primary-500">.</span>
      </h1>
      <p class="mt-2.5 max-w-135 text-base text-secondary-500">
        Puedes combinar <strong class="text-secondary-900">cursos individuales</strong> y
        <strong class="text-secondary-900">líneas de carrera</strong> en una sola compra.
      </p>
    </header>

    <div class="grid items-start gap-8 min-[900px]:grid-cols-[1.6fr_1fr]">
      <section class="min-w-0">
        <!-- Los problemas sin línea concreta (moneda mixta) van arriba: no
             pertenecen a ningún ítem en particular. -->
        <div
          v-for="problem in cart.globalProblems"
          :key="problem.code"
          class="mb-3.5 rounded-adm-md border border-danger-DEFAULT/40 bg-danger-soft px-4 py-3 text-[0.875rem] text-danger-DEFAULT"
        >
          {{ problem.message }}
        </div>

        <div class="space-y-3.5">
          <CartItemRow
            v-for="item in cart.items"
            :key="item.offerId"
            :item="item"
            :problem="cart.problemOf(item.offerId)"
            @remove="cart.remove"
          />
        </div>

        <!-- Recomendaciones: solo se dibuja si hay algo que recomendar. -->
        <CartUpsell />
      </section>

      <!-- En una columna el resumen va ARRIBA: el total y el CTA a la vista sin bajar. -->
      <aside class="-order-1 flex flex-col gap-4 min-[900px]:sticky min-[900px]:-top-5 min-[900px]:order-0">
        <CheckoutSummary />
        <CartGuarantee />
        <div class="flex flex-wrap items-center justify-center gap-3.5 py-1.5">
          <PayMark v-for="brand in PAYMENT_BRANDS" :key="brand" :name="brand" :height="22" />
        </div>
      </aside>
    </div>
    </template>
  </CheckoutLayout>
</template>
