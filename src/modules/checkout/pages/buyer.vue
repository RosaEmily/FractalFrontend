<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import profileService from "@/modules/admin/services/auth.service";
import CheckoutLayout from "../layouts/main.vue";
import StepLayout from "../components/StepLayout.vue";
import { useCartStore } from "../stores/useCartStore";

const router = useRouter();
const cart = useCartStore();
const profile = ref<{ first_name?: string; last_name?: string; email?: string } | null>(null);
const loading = ref(true);

/*
 * Se muestran los datos de la cuenta, no un formulario: el nombre y el correo
 * ya están en el perfil, y el documento —lo único que la matrícula necesita de
 * más— lo administra el centro, no el alumno.
 *
 * ⚠️ Los datos de FACTURACIÓN (boleta/factura, RUC, razón social) no se piden
 * todavía: no existe dónde guardarlos. Cuando el esquema los soporte, este es
 * el paso donde entran.
 */
onMounted(async () => {
  if (cart.isEmpty) {
    router.replace({ name: "checkout-cart" });
    return;
  }

  // Repone los totales del resumen tras una recarga directa a este paso.
  cart.ensureValidated();

  const { data } = await safeRequest(() => profileService.me(), { showAlert: false });
  profile.value = data;
  loading.value = false;
});
</script>

<template>
  <CheckoutLayout step="buyer">
    <StepLayout
      eyebrow="Paso 3 de 4"
      title="Confirma tus datos"
      sub="La matrícula y el comprobante se emiten a nombre de esta cuenta."
      primary="Continuar al pago"
      :primary-disabled="loading"
      @back="router.push({ name: 'checkout-cart' })"
      @primary="router.push({ name: 'checkout-method' })"
    >
      <div class="rounded-adm-lg border border-line bg-surface-paper p-6">
        <dl class="space-y-4">
          <div>
            <dt class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
              Nombre
            </dt>
            <dd class="mt-1 text-[0.938rem] font-medium text-secondary-900">
              {{ loading ? "—" : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "—" }}
            </dd>
          </div>
          <div>
            <dt class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
              Correo
            </dt>
            <dd class="mt-1 text-[0.938rem] font-medium text-secondary-900">
              {{ loading ? "—" : (profile?.email ?? "—") }}
            </dd>
          </div>
        </dl>

        <p class="mt-5 border-t border-line pt-4 text-[0.813rem] leading-relaxed text-secondary-400">
          ¿Algún dato incorrecto? Puedes corregir tu nombre desde
          <span class="font-medium text-secondary-500">Mi cuenta</span> en el aula.
          El documento y el correo los actualiza administración.
        </p>
      </div>
    </StepLayout>
  </CheckoutLayout>
</template>
