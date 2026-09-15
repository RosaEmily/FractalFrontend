<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import CheckoutLayout from "../layouts/main.vue";
import StepLayout from "../components/StepLayout.vue";
import PayMark from "../components/PayMark.vue";
import QrCode from "../components/QrCode.vue";
import type { PaymentMethod } from "../models/checkout.model";
import { checkoutService } from "../services/checkout.service";
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const toast = useToastStore();

const method = ref<PaymentMethod | null>(null);
const loading = ref(true);
const paying = ref(false);

const methodId = Number(route.query.method);

const total = computed(() => cart.totals?.total ?? cart.localTotal);

/** Qué explica la pantalla, según cómo cobra el método elegido. */
const SUB: Record<PaymentMethod["type"], string> = {
  card: "Ingresa los datos de tu tarjeta. La transacción se valida con 3D Secure.",
  wallet: "Escanea el código con tu app y confirma el pago desde tu celular.",
  redirect: "Serás redirigido a la pasarela segura para completar el pago.",
};

onMounted(async () => {
  if (cart.isEmpty || !methodId) {
    router.replace({ name: "checkout-cart" });
    return;
  }

  cart.ensureValidated();

  const { data } = await safeRequest(() => checkoutService.methods(), { showAlert: false });
  method.value = (data ?? []).find((m) => m.id === methodId) ?? null;
  loading.value = false;

  // Un método que ya no está activo no puede cobrar: se vuelve a elegir.
  if (!method.value) router.replace({ name: "checkout-method" });
});

/**
 * Registra la matrícula.
 *
 * ⚠️ **No cobra.** Ninguna pasarela está integrada: sea tarjeta, QR o redirect,
 * lo que ocurre es lo mismo — se crea la matrícula con la transacción pendiente.
 * Por eso ninguna variante promete un cargo hecho.
 */
const pay = async () => {
  if (paying.value || !method.value) return;

  const ok = await cart.validate();
  if (!ok) {
    toast.showToastError({ detail: "Revisa tu carrito: hay programas que ya no se pueden comprar." });
    router.push({ name: "checkout-cart" });
    return;
  }

  paying.value = true;
  const { data, error } = await safeRequest(
    () => checkoutService.purchase(cart.offerIds, method.value!.id),
    { showAlert: false },
  );
  paying.value = false;

  if (!data) {
    // El rechazo tiene pantalla propia: explica los motivos y ofrece salidas.
    router.replace({
      name: "checkout-rejected",
      query: { method: String(method.value.id), reason: error?.message ?? "" },
    });
    return;
  }

  cart.clear();
  router.replace({ name: "checkout-success", query: { enrollment: String(data.enrollment_id) } });
};
</script>

<template>
  <CheckoutLayout step="card">
    <StepLayout
      :eyebrow="`MÉTODO · ${(method?.name ?? '').toUpperCase()}`"
      title="Completa tu pago."
      :sub="method ? SUB[method.type] : ''"
      @back="router.push({ name: 'checkout-method' })"
    >
      <div v-if="loading" class="h-64 max-w-140 animate-pulse rounded-adm-lg bg-surface-cream" />

      <div v-else-if="method" class="max-w-140">
        <!-- ── Tarjeta ──────────────────────────────────────────────── -->
        <div v-if="method.type === 'card'" class="rounded-adm-lg border border-line bg-surface-paper p-7">
          <!-- Tarjeta ilustrativa: da contexto de qué se está llenando. -->
          <div
            class="relative mb-6 overflow-hidden rounded-adm-lg p-6 text-white"
            style="background: linear-gradient(135deg, #1F1A14 0%, #2D2418 100%)"
          >
            <span class="absolute -top-8 -right-8 size-35 rounded-pill bg-primary-500 opacity-25" />
            <div class="relative flex items-center justify-between">
              <span class="h-8 w-[2.625rem] rounded-adm-sm" style="background: linear-gradient(135deg,#E8C16B,#B8923B)" />
              <PayMark name="visa" :height="26" />
            </div>
            <p class="relative mt-[1.625rem] font-mono text-[1.313rem] tracking-[0.12em]">
              •••• •••• •••• ••••
            </p>
            <div class="relative mt-[1.125rem] flex justify-between font-mono text-xs">
              <span><span class="block text-[0.563rem] opacity-60">TITULAR</span>—</span>
              <span><span class="block text-[0.563rem] opacity-60">VENCE</span>—</span>
            </div>
          </div>

          <!--
            Los campos van deshabilitados a propósito: sin pasarela integrada,
            un formulario que acepte un número de tarjeta real recogería datos
            sensibles que nadie puede procesar ni proteger.
          -->
          <div class="grid gap-3.5 sm:grid-cols-2">
            <label class="sm:col-span-2 block">
              <span class="mb-1.5 block text-[0.813rem] font-medium text-secondary-500">Número de tarjeta</span>
              <input type="text" disabled placeholder="0000 0000 0000 0000"
                class="w-full cursor-not-allowed rounded-adm-md border border-line bg-surface-page px-3.5 py-2.5 text-[0.906rem] text-secondary-400" />
            </label>
            <label class="sm:col-span-2 block">
              <span class="mb-1.5 block text-[0.813rem] font-medium text-secondary-500">Nombre del titular</span>
              <input type="text" disabled placeholder="Como aparece en la tarjeta"
                class="w-full cursor-not-allowed rounded-adm-md border border-line bg-surface-page px-3.5 py-2.5 text-[0.906rem] text-secondary-400" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-[0.813rem] font-medium text-secondary-500">Vencimiento</span>
              <input type="text" disabled placeholder="MM/AA"
                class="w-full cursor-not-allowed rounded-adm-md border border-line bg-surface-page px-3.5 py-2.5 text-[0.906rem] text-secondary-400" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-[0.813rem] font-medium text-secondary-500">CVV</span>
              <input type="text" disabled placeholder="123"
                class="w-full cursor-not-allowed rounded-adm-md border border-line bg-surface-page px-3.5 py-2.5 text-[0.906rem] text-secondary-400" />
            </label>
          </div>

          <p class="mt-4 rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-4 py-3 text-[0.813rem] leading-relaxed text-secondary-500">
            El cobro con tarjeta todavía no está habilitado. Al continuar
            registramos tu matrícula y coordinación te contacta para completar el
            pago.
          </p>
        </div>

        <!-- ── Billetera (QR) ───────────────────────────────────────── -->
        <div v-else-if="method.type === 'wallet'" class="rounded-adm-lg border border-line bg-surface-paper p-8 text-center">
          <div class="mb-[1.125rem] inline-flex"><PayMark :name="method.name" :height="34" /></div>

          <div class="mx-auto size-[13.125rem] rounded-adm-lg border border-line bg-white p-4 shadow-sm">
            <QrCode />
          </div>

          <p class="mt-5 text-[0.938rem] font-semibold text-secondary-900">
            Escanea con {{ method.name }} y paga {{ formatMoney(total) }}
          </p>
          <p class="mt-4 rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-4 py-3 text-left text-[0.813rem] leading-relaxed text-secondary-500">
            Este código es de muestra: {{ method.name }} aún no está integrado.
            Al continuar registramos tu matrícula y coordinación valida el pago.
          </p>
        </div>

        <!-- ── Pasarela externa ─────────────────────────────────────── -->
        <div v-else class="rounded-adm-lg border border-line bg-surface-paper p-8 text-center">
          <div class="mb-[1.375rem] inline-flex"><PayMark :name="method.name" :height="38" /></div>

          <h3 class="font-display text-[1.375rem] font-bold text-secondary-900">
            Te llevaremos a {{ method.name }}
          </h3>
          <p class="mx-auto mt-3 max-w-95 text-sm leading-relaxed text-secondary-500">
            Completarás el pago de <strong class="text-secondary-900">{{ formatMoney(total) }}</strong>
            en el entorno seguro de {{ method.name }}. Al terminar, volverás a Fractal.
          </p>

          <p class="mt-4 rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-4 py-3 text-left text-[0.813rem] leading-relaxed text-secondary-500">
            La conexión con {{ method.name }} aún no está habilitada. Al continuar
            registramos tu matrícula y coordinación valida el pago.
          </p>
        </div>

        <LandingButton
          variant="primary"
          size="lg"
          :arrow="false"
          class="mt-[1.375rem] w-full justify-center"
          :class="paying ? 'pointer-events-none opacity-55' : ''"
          @click="pay"
        >
          {{ paying ? "Procesando…" : `Registrar matrícula — ${formatMoney(total)}` }}
        </LandingButton>
      </div>
    </StepLayout>
  </CheckoutLayout>
</template>
