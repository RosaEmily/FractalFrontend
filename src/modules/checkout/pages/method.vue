<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import CheckoutLayout from "../layouts/main.vue";
import StepLayout from "../components/StepLayout.vue";
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

/** Qué le pasa al usuario tras elegir, según cómo cobra el método. */
const HINT: Record<PaymentMethod["type"], string> = {
  card: "Ingresarás los datos de tu tarjeta en el siguiente paso.",
  wallet: "Escanearás un código QR desde tu app.",
  redirect: "Te llevaremos a la pasarela para completar el pago.",
};

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
  <CheckoutLayout step="method">
    <StepLayout
      eyebrow="Paso 4 de 4"
      title="Elige cómo pagar"
      primary="Continuar"
      :primary-disabled="!selected || loading"
      :loading="paying"
      @back="router.push({ name: 'checkout-buyer' })"
      @primary="goToPayment"
    >
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-[4.5rem] animate-pulse rounded-adm-md bg-surface-cream" />
      </div>

      <div v-else class="space-y-3">
        <label
          v-for="method in methods"
          :key="method.id"
          class="flex cursor-pointer items-center gap-4 rounded-adm-md border bg-surface-paper p-4 transition-colors"
          :class="selected === method.id ? 'border-primary-500 bg-accent-soft' : 'border-line hover:border-secondary-400'"
        >
          <input
            v-model="selected"
            type="radio"
            name="payment-method"
            :value="method.id"
            class="size-4 shrink-0 accent-primary-500"
          />
          <PayMark :name="method.name" :height="24" class="shrink-0" />
          <span class="min-w-0 flex-1">
            <span class="block font-display text-[0.938rem] font-bold text-secondary-900">
              {{ method.name }}
            </span>
            <span class="block text-[0.813rem] text-secondary-500">{{ method.description }}</span>
          </span>
        </label>
      </div>

      <p v-if="selected && !loading" class="mt-4 text-[0.813rem] text-secondary-400">
        {{ HINT[methods.find((m) => m.id === selected)?.type ?? "redirect"] }}
      </p>
    </StepLayout>
  </CheckoutLayout>
</template>
