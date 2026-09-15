<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CheckoutLayout from "../layouts/main.vue";
import { HeroCore } from "@/shared/components";
import { mdiEmailOutline, mdiWhatsapp, mdiCalendarCheckOutline } from "@mdi/js";

const route = useRoute();
const router = useRouter();

/** El id de la matrícula ES el número de pedido: no hay otro correlativo. */
const enrollmentId = route.query.enrollment as string | undefined;

/** Mismo número que usa la landing (`ProgramDetailView`). */
const WHATSAPP_URL = "https://wa.me/51987654321";

/*
 * ⚠️ Ningún paso promete acceso inmediato al aula: el pago queda pendiente
 * hasta que coordinación lo valide. El diseño sí lo promete porque no tiene
 * backend detrás.
 */
const NEXT_STEPS = [
  {
    icon: mdiEmailOutline,
    title: "Revisa tu correo",
    description:
      "Te enviamos el detalle de la matrícula y los pasos para completar el pago.",
    href: null,
    cta: null,
  },
  {
    icon: mdiCalendarCheckOutline,
    title: "Confirmación del pago",
    description:
      "Coordinación valida el pago y activa tu acceso al aula. Te avisamos por correo.",
    href: null,
    cta: null,
  },
  {
    icon: mdiWhatsapp,
    title: "¿Tienes dudas?",
    description: "Escríbenos y te ayudamos con tu matrícula o el pago.",
    href: WHATSAPP_URL,
    cta: "Escribir",
  },
];
</script>

<template>
  <CheckoutLayout step="success" :show-steps="false">
    <div class="mx-auto max-w-lg py-6 text-center">
      <div
        class="mx-auto grid size-16 place-items-center rounded-pill bg-success-soft"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          class="text-success-DEFAULT"
          aria-hidden="true"
        >
          <path
            d="M5 12.5 L10 17.5 L19 7"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h1
        class="mt-5 font-display text-3xl font-bold tracking-tight text-secondary-900"
      >
        Matrícula registrada
      </h1>
      <p class="mt-3 text-[0.938rem] leading-relaxed text-secondary-500">
        Guardamos tu matrícula
        <span
          v-if="enrollmentId"
          class="font-mono font-semibold text-secondary-900"
        >
          #{{ enrollmentId }}
        </span>
        y te enviamos los datos a tu correo.
      </p>

      <!--
        Se dice con todas las letras que el pago está PENDIENTE. La pasarela no
        está integrada: prometer acceso inmediato al aula sería mentir, y el
        alumno llegaría a una puerta cerrada sin saber por qué.
      -->
      <div
        class="mt-6 rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-5 py-4 text-left"
      >
        <p class="font-display text-[0.938rem] font-bold text-secondary-900">
          Falta confirmar el pago
        </p>
        <p class="mt-1.5 text-[0.875rem] leading-relaxed text-secondary-500">
          Tu matrícula queda reservada como <strong>pendiente</strong>.
          Coordinación validará el pago y activará tu acceso al aula virtual. Te
          avisamos por correo en cuanto esté listo.
        </p>
      </div>

      <!--
        "¿Qué sigue?" del diseño, adaptado: el diseño promete "tus accesos ya
        están activos" y acá el pago queda PENDIENTE, así que cada paso dice lo
        que de verdad se puede hacer ahora.
      -->
      <section class="mt-8 text-left">
        <h3
          class="font-display text-xl font-bold tracking-tight text-secondary-900"
        >
          ¿Qué sigue?
        </h3>

        <ul class="mt-4 space-y-3">
          <li
            v-for="step in NEXT_STEPS"
            :key="step.title"
            class="flex items-start gap-3.5 rounded-adm-md border border-line bg-surface-paper p-4"
          >
            <span
              class="grid size-9 shrink-0 place-items-center rounded-adm-sm bg-accent-soft text-primary-500"
            >
              <HeroCore :path="step.icon" class="size-4.5" />
            </span>
            <span class="min-w-0 flex-1">
              <span
                class="block font-display text-[0.938rem] font-bold text-secondary-900"
              >
                {{ step.title }}
              </span>
              <span
                class="mt-0.5 block text-[0.875rem] leading-relaxed text-secondary-500"
              >
                {{ step.description }}
              </span>
            </span>
            <a
              v-if="step.href"
              :href="step.href"
              target="_blank"
              rel="noopener"
              class="shrink-0 self-center text-[0.875rem] font-semibold text-primary-600"
            >
              {{ step.cta }}
            </a>
          </li>
        </ul>
      </section>

      <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <LandingButton
          variant="primary"
          size="lg"
          class="justify-center"
          @click="router.push({ name: 'classroom-home' })"
        >
          Ir al aula
        </LandingButton>
        <LandingButton
          variant="secondary"
          size="lg"
          :arrow="false"
          class="justify-center"
          @click="router.push({ name: 'programs' })"
        >
          Ver más programas
        </LandingButton>
      </div>
    </div>
  </CheckoutLayout>
</template>
