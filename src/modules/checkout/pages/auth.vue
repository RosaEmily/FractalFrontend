<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { hasSession } from "@/shared/utils/session";
import CheckoutLayout from "../layouts/main.vue";
import StepLayout from "../components/StepLayout.vue";
import { useCartStore } from "../stores/useCartStore";
import { useSiteContact } from "@/modules/landing/composables/useSiteContact";

const router = useRouter();
const cart = useCartStore();
const { advisorHref } = useSiteContact();
const authenticated = ref(false);

/*
 * La compra necesita una sesión de AULA: la matrícula se crea contra la ficha
 * de estudiante del token, y un ADMIN no tiene ficha. Por eso se comprueba la
 * cookie del aula y no "cualquier sesión".
 */
onMounted(() => {
  authenticated.value = hasSession("classroom");
  if (authenticated.value) router.replace({ name: "checkout-buyer" });
});

/*
 * El login vive en su propia pantalla, no duplicado acá: es el mismo formulario
 * del aula, con su validación de zona y su manejo de sesión. `redirect` trae de
 * vuelta al checkout con el carrito intacto — vive en localStorage.
 */
const goLogin = () =>
  router.push({ name: "classroom-login", query: { redirect: "/checkout/datos" } });
</script>

<template>
  <CheckoutLayout step="auth" primary="Iniciar sesión" @primary="goLogin">
    <StepLayout
      :index="2"
      eyebrow="Cuenta"
      title="Inicia sesión para continuar."
      sub="Necesitas una cuenta para acceder al aula virtual, tus certificados y el historial de compras."
      @back="router.push({ name: 'checkout-cart' })"
    >
      <div class="rounded-adm-lg border border-line bg-surface-paper p-6">
        <p class="text-[0.906rem] leading-relaxed text-secondary-500">
          Usa el correo con el que te matriculaste. Si es tu primera compra,
          escríbenos y creamos tu acceso.
        </p>

        <!--
          El registro autónomo no existe todavía: `auth/register` pide campos que
          este formulario no recoge, y matricularse exige además una ficha de
          estudiante con documento que sólo administración crea. Prometer una
          cuenta nueva acá llevaría a un error sin salida.
        -->
        <p class="mt-4 border-t border-line pt-4 text-[0.813rem] leading-relaxed text-secondary-400">
          ¿Aún no tienes cuenta? El acceso se crea con tu matrícula.
          <a :href="advisorHref()" target="_blank" rel="noopener" class="font-medium text-primary-500 underline">
            Escríbenos por WhatsApp
          </a>
          y te ayudamos.
        </p>
      </div>

      <p v-if="cart.count" class="mt-4 text-[0.813rem] text-secondary-400">
        Tu carrito se conserva mientras inicias sesión.
      </p>
    </StepLayout>
  </CheckoutLayout>
</template>
