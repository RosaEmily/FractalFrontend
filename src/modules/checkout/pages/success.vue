<script setup lang="ts">
import { computed } from "vue";
import { useSiteContact } from "@/modules/landing/composables/useSiteContact";
import { useRoute, useRouter } from "vue-router";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CheckoutLayout from "../layouts/main.vue";
import { HeroCore } from "@/shared/components";
import { mdiEmailOutline, mdiWhatsapp, mdiCalendarCheckOutline } from "@mdi/js";

const route = useRoute();
const router = useRouter();

/** El id de la matrícula ES el número de pedido: no hay otro correlativo. */
const enrollmentId = route.query.enrollment as string | undefined;

const { advisorHref } = useSiteContact();

/*
 * La compra llega acá solo con el cobro aprobado (`payment_status = paid`): la
 * matrícula ya está pagada y sus cursos desbloqueados, así que el acceso al
 * aula es inmediato.
 */
const NEXT_STEPS = computed(() => [
  {
    icon: mdiEmailOutline,
    title: "Revisa tu correo",
    description:
      "Te enviamos el detalle de la matrícula y el comprobante del pago.",
    href: null,
    cta: null,
  },
  {
    icon: mdiCalendarCheckOutline,
    title: "Tu acceso ya está activo",
    description:
      "Tus cursos ya aparecen en el aula virtual: entra cuando quieras con tu correo.",
    href: null,
    cta: null,
  },
  {
    icon: mdiWhatsapp,
    title: "¿Tienes dudas?",
    description: "Escríbenos y te ayudamos con tu matrícula o el pago.",
    href: advisorHref(),
    cta: "Escribir",
  },
]);
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

      <div
        class="mt-6 rounded-adm-md border border-success-DEFAULT/30 bg-success-soft px-5 py-4 text-left"
      >
        <p class="font-display text-[0.938rem] font-bold text-secondary-900">
          Pago confirmado
        </p>
        <p class="mt-1.5 text-[0.875rem] leading-relaxed text-secondary-500">
          Tu matrícula quedó <strong>pagada</strong> y tu acceso al aula virtual
          ya está activo.
        </p>
      </div>

      <!--
        "¿Qué sigue?" del diseño: con el pago aprobado el acceso ya está
        activo, como promete el diseño.
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
