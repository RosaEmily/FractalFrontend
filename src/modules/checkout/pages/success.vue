<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CheckoutLayout from "../layouts/main.vue";

const route = useRoute();
const router = useRouter();

/** El id de la matrícula ES el número de pedido: no hay otro correlativo. */
const enrollmentId = route.query.enrollment as string | undefined;
</script>

<template>
  <CheckoutLayout step="success" :show-steps="false">
    <div class="mx-auto max-w-lg py-6 text-center">
      <div class="mx-auto grid size-16 place-items-center rounded-pill bg-success-soft">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" class="text-success-DEFAULT" aria-hidden="true">
          <path d="M5 12.5 L10 17.5 L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <h1 class="mt-5 font-display text-3xl font-bold tracking-tight text-secondary-900">
        Matrícula registrada
      </h1>
      <p class="mt-3 text-[0.938rem] leading-relaxed text-secondary-500">
        Guardamos tu matrícula
        <span v-if="enrollmentId" class="font-mono font-semibold text-secondary-900">
          #{{ enrollmentId }}
        </span>
        y te enviamos los datos a tu correo.
      </p>

      <!--
        Se dice con todas las letras que el pago está PENDIENTE. La pasarela no
        está integrada: prometer acceso inmediato al aula sería mentir, y el
        alumno llegaría a una puerta cerrada sin saber por qué.
      -->
      <div class="mt-6 rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-5 py-4 text-left">
        <p class="font-display text-[0.938rem] font-bold text-secondary-900">
          Falta confirmar el pago
        </p>
        <p class="mt-1.5 text-[0.875rem] leading-relaxed text-secondary-500">
          Tu matrícula queda reservada como <strong>pendiente</strong>. Coordinación
          validará el pago y activará tu acceso al aula virtual. Te avisamos por
          correo en cuanto esté listo.
        </p>
      </div>

      <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <LandingButton variant="primary" size="lg" class="justify-center" @click="router.push({ name: 'classroom-home' })">
          Ir al aula
        </LandingButton>
        <LandingButton variant="secondary" size="lg" :arrow="false" class="justify-center" @click="router.push({ name: 'programs' })">
          Ver más programas
        </LandingButton>
      </div>
    </div>
  </CheckoutLayout>
</template>
