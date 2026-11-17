<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import Logo from "@/assets/fractal.png";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import {
  syncClassroomUser,
  useClassroomRole,
} from "@/modules/classroom/composables/useClassroomRole";
import { hasSession } from "@/shared/utils/session";
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
  defineProps<{
    step: CheckoutStep;
    showSteps?: boolean;
    /** CTA del paso: vive en el footer, no en el cuerpo de la pantalla. */
    primary?: string;
    primaryDisabled?: boolean;
    loading?: boolean;
  }>(),
  { showSteps: true, primary: "", primaryDisabled: false, loading: false },
);

defineEmits<{ primary: [] }>();

const router = useRouter();
const cart = useCartStore();
const confirmCancel = ref(false);

/*
 * Con sesión de AULA no hay paso Cuenta: la barra lo quita y la cabecera
 * muestra a quién se le va a matricular. Se lee al montar porque una cookie no
 * es reactiva, y el perfil se relee por si cambió en otra pestaña.
 */
const loggedIn = ref(false);
const { fullName, initials, user } = useClassroomRole();

onMounted(() => {
  syncClassroomUser();
  loggedIn.value = hasSession("classroom");
});

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
  <!-- La pantalla mide lo que la ventana: cabecera y footer quedan quietos y
       solo el contenido hace scroll, dentro del <main>. -->
  <div class="flex h-dvh flex-col overflow-hidden bg-surface-page">
    <header
      class="z-40 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b md:gap-6 border-line bg-surface-paper/92 px-[1.125rem] py-4 backdrop-blur-md sm:px-8 lg:px-16"
    >
      <RouterLink to="/" class="shrink-0 justify-self-start">
        <img :src="Logo" alt="Fractal Studio" class="h-9" />
      </RouterLink>

      <!-- La barra desaparece al terminar: en confirmación o rechazo ya no
           hay pasos que recorrer y marcaría un avance sin sentido. -->
      <div v-if="props.showSteps">
        <CheckoutStepBar :current="step" :logged-in="loggedIn" class="hidden md:flex" />
        <CheckoutStepBar :current="step" :logged-in="loggedIn" compact class="md:hidden" />
      </div>
      <span v-else />

      <div class="flex items-center justify-end">
        <div v-if="loggedIn && fullName" class="flex items-center gap-[0.563rem]">
          <span
            class="grid size-[1.875rem] shrink-0 place-items-center rounded-pill bg-accent-soft font-display text-[0.813rem] font-bold text-primary-600"
          >
            {{ initials }}
          </span>
          <span class="hidden flex-col leading-tight sm:flex">
            <span class="text-[0.813rem] font-bold whitespace-nowrap text-secondary-900">{{ fullName }}</span>
            <span class="font-mono text-[0.656rem] whitespace-nowrap text-secondary-400">{{ user?.email }}</span>
          </span>
        </div>
      </div>
    </header>

    <ConfirmDialog
      :open="confirmCancel"
      danger
      title="¿Cancelar esta compra?"
      body="Perderás los ítems de tu carrito y el progreso de este pedido. Puedes volver a empezar cuando quieras desde el catálogo."
      confirm-label="Sí, cancelar"
      cancel-label="Seguir comprando"
      @confirm="cancelPurchase"
      @dismiss="confirmCancel = false"
    />

    <main class="flex min-h-0 flex-1 flex-col overflow-y-auto px-[1.125rem] pt-7 pb-16 sm:px-8 sm:pt-10 lg:px-16">
      <slot />
    </main>

    <!-- Solo mientras haya compra que cancelar: en la confirmación ya se
         registró la matrícula y no hay nada que abandonar. -->
    <footer
      v-if="props.showSteps"
      class="z-30 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line bg-surface-paper/92 px-[1.125rem] py-3.5 backdrop-blur-md sm:px-8 lg:px-16"
    >
      <LandingButton variant="secondary" size="sm" :arrow="false" @click="confirmCancel = true">
        Cancelar compra
      </LandingButton>

      <div class="flex items-center gap-3 sm:gap-5">
        <span
          class="hidden items-center gap-2 sm:inline-flex font-mono text-[0.688rem] font-semibold tracking-[0.06em] whitespace-nowrap text-secondary-500"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="text-success-DEFAULT" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.7" />
            <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            <circle cx="12" cy="15" r="1.6" fill="currentColor" />
          </svg>
          <span class="hidden sm:inline">PAGO SEGURO · SSL</span>
          <span class="sm:hidden">SSL</span>
        </span>

        <LandingButton
          v-if="props.primary"
          variant="primary"
          size="md"
          :class="props.primaryDisabled || props.loading ? 'pointer-events-none opacity-50' : ''"
          @click="$emit('primary')"
        >
          {{ props.loading ? "Procesando…" : props.primary }}
        </LandingButton>
      </div>
    </footer>
  </div>
</template>
