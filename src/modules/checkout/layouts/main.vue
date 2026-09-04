<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Logo from "@/assets/fractal.png";
import CheckoutStepBar from "../components/CheckoutStepBar.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import type { CheckoutStep } from "../constants/steps";
import { useCartStore } from "../stores/useCartStore";

/*
 * ⚠️ `showSteps` necesita default explícito: Vue castea las props booleanas
 * ausentes a `false`, no a `undefined`, así que `showSteps !== false` era falso
 * en todas las pantallas que no la pasaban — la barra de pasos y el botón de
 * cancelar no se renderizaban nunca.
 */
const props = withDefaults(
  defineProps<{ step: CheckoutStep; showSteps?: boolean }>(),
  { showSteps: true },
);

const router = useRouter();
const cart = useCartStore();
const confirmCancel = ref(false);

/*
 * Cancelar VACÍA el carrito, así que se confirma antes: es destructivo y el
 * usuario puede haber armado un pedido de varios programas. Salir sin más
 * (el logo, el botón atrás) no borra nada.
 */
const cancelPurchase = () => {
  confirmCancel.value = false;
  cart.clear();
  router.push({ name: "programs" });
};
</script>

<template>
  <div class="min-h-dvh bg-surface-page">
    <!-- Franja de seguridad: el diseño la usa para dar contexto de pago. -->
    <div
      class="flex items-center justify-between bg-secondary-900 px-6 py-2 font-mono text-[0.688rem] tracking-[0.08em] text-white md:px-16"
    >
      <span class="inline-flex items-center gap-2">
        <span class="size-1.5 rounded-pill bg-success-DEFAULT" />
        CONEXIÓN SEGURA · HTTPS
      </span>
      <span class="text-white/70">UTC-5 / LIMA</span>
    </div>

    <header
      class="sticky top-0 z-40 border-b border-line bg-surface-paper/85 px-6 py-3.5 backdrop-blur-md md:px-16"
    >
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <RouterLink to="/" class="shrink-0">
          <img :src="Logo" alt="Fractal Studio" class="h-9" />
        </RouterLink>

        <!-- La barra desaparece al terminar: en confirmación o rechazo ya no
             hay pasos que recorrer y marcaría un avance sin sentido. -->
        <CheckoutStepBar v-if="props.showSteps" :current="step" class="hidden md:flex" />

        <div class="flex items-center gap-[1.125rem]">
          <!-- Solo mientras haya compra que cancelar: en la confirmación ya se
               registró la matrícula y no hay nada que abandonar. -->
          <button
            v-if="props.showSteps"
            type="button"
            class="cursor-pointer font-body text-[0.813rem] font-semibold whitespace-nowrap text-secondary-400 transition-colors hover:text-secondary-900"
            @click="confirmCancel = true"
          >
            Cancelar compra
          </button>

          <span
            class="inline-flex items-center gap-2 font-mono text-[0.688rem] font-semibold tracking-[0.06em] whitespace-nowrap text-secondary-500"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" class="text-success-DEFAULT" aria-hidden="true">
              <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" />
              <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="hidden sm:inline">PAGO SEGURO · SSL</span>
            <span class="sm:hidden">SSL</span>
          </span>
        </div>
      </div>
    </header>

    <ConfirmDialog
      :open="confirmCancel"
      danger
      title="¿Cancelar esta compra?"
      body="Perderás los programas de tu carrito y el progreso de este pedido. Puedes volver a empezar cuando quieras desde el catálogo."
      confirm-label="Sí, cancelar"
      cancel-label="Seguir comprando"
      @confirm="cancelPurchase"
      @dismiss="confirmCancel = false"
    />

    <main class="mx-auto max-w-6xl px-6 py-10 md:px-16 md:py-14">
      <slot />
    </main>
  </div>
</template>
