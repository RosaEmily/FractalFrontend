<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import CheckoutLayout from "../layouts/main.vue";
import StepLayout from "../components/StepLayout.vue";
import RadioButton from "primevue/radiobutton";
import PayMark from "../components/PayMark.vue";
import type { PaymentMethod } from "../models/checkout.model";
import { checkoutService } from "../services/checkout.service";
import { useCartStore } from "../stores/useCartStore";

const router = useRouter();
const cart = useCartStore();
const toast = useToastStore();

const methods = ref<PaymentMethod[]>([]);
const selected = ref<number | null>(null);
const loading = ref(true);
const paying = ref(false);

// Una tarjeta no es una marca: la fila muestra las que acepta, como el carrito.
const CARD_BRANDS = ["visa", "mastercard", "amex"];

onMounted(async () => {
  /*
   * Cada paso es una URL recargable, así que se puede llegar aquí sin haber
   * pasado por el carrito: sin ítems no hay nada que pagar.
   */
  if (cart.isEmpty) {
    router.replace({ name: "checkout-cart" });
    return;
  }

  // Repone los totales del servidor tras una recarga; si no, el resumen
  // quedaría en S/ 0.00 hasta que el usuario volviera al carrito.
  cart.ensureValidated();

  const { data } = await safeRequest(() => checkoutService.methods(), { showAlert: false });
  methods.value = data ?? [];
  // Preselecciona el primero: negocio ya decidió el orden con `sort_order`.
  selected.value = methods.value[0]?.id ?? null;
  loading.value = false;
});

/**
 * Avanza a la pantalla de cobro del método elegido.
 *
 * No compra aquí: cada método tiene su propia pantalla (formulario de tarjeta,
 * QR de billetera o salto a la pasarela), y esa es la que registra la matrícula.
 * Antes se compraba directo desde este paso, saltándose esas tres pantallas del
 * diseño.
 */
const goToPayment = async () => {
  if (!selected.value || paying.value) return;

  // Revalida antes de avanzar: el cupo pudo llenarse mientras elegía el método.
  paying.value = true;
  const ok = await cart.validate();
  paying.value = false;

  if (!ok) {
    toast.showToastError({ detail: "Revisa tu carrito: hay programas que ya no se pueden comprar." });
    router.push({ name: "checkout-cart" });
    return;
  }

  router.push({ name: "checkout-pay", query: { method: String(selected.value) } });
};
</script>

<template>
  <CheckoutLayout
    step="method"
    :primary="selected ? 'Continuar' : 'Selecciona un método'"
    :primary-disabled="!selected || loading"
    :loading="paying"
    @primary="goToPayment"
  >
    <StepLayout
      :index="4"
      eyebrow="Método de pago"
      title="Elige cómo pagar."
      sub="Procesamos tu pago con pasarelas certificadas. Tus datos viajan cifrados y no se almacenan en nuestros servidores."
      @back="router.push({ name: 'checkout-buyer' })"
    >
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-[4.5rem] animate-pulse rounded-adm-md bg-surface-cream" />
      </div>

      <div v-else class="flex max-w-160 flex-col gap-3">
        <label
          v-for="method in methods"
          :key="method.id"
          class="flex cursor-pointer items-center gap-4 rounded-adm-lg border-[1.5px] bg-surface-paper px-5 py-[1.125rem] transition-all"
          :class="selected === method.id ? 'border-primary-500 shadow-md' : 'border-line shadow-sm hover:border-secondary-400'"
        >
          <RadioButton
            v-model="selected"
            name="payment-method"
            :value="method.id"
            class="shrink-0"
          />
          <span class="min-w-0 flex-1">
            <span class="block font-display text-[1.063rem] font-bold text-secondary-900">
              {{ method.name }}
            </span>
            <span class="mt-[0.188rem] block text-[0.813rem] text-secondary-500">{{ method.description }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-2">
            <PayMark
              v-for="brand in method.type === 'card' ? CARD_BRANDS : [method.name]"
              :key="brand"
              :name="brand"
              :height="method.type === 'card' ? 22 : 26"
              :class="brand === 'amex' ? 'max-sm:hidden' : ''"
            />
          </span>
        </label>

        <p class="mt-1 flex items-center gap-2 text-[0.781rem] text-secondary-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="shrink-0 text-success-DEFAULT" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.7" />
            <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            <circle cx="12" cy="15" r="1.6" fill="currentColor" />
          </svg>
          Certificado PCI-DSS · verificación 3D Secure
        </p>
      </div>
    </StepLayout>
  </CheckoutLayout>
</template>
