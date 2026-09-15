<script setup lang="ts">
import { computed } from "vue";
import { CHECKOUT_STEPS, type CheckoutStep } from "../constants/steps";

const props = defineProps<{ current: CheckoutStep }>();

/*
 * `method` y `card` son dos pantallas pero UN paso para el usuario: la barra
 * marcaría un avance que no ocurrió al elegir el método y volver a pagar.
 */
const activeIndex = computed(() => {
  const key = props.current === "card" ? "method" : props.current;
  return CHECKOUT_STEPS.findIndex((s) => s.key === key);
});
</script>

<template>
  <ol class="flex flex-wrap items-center gap-2 sm:gap-3.5">
    <li
      v-for="(step, index) in CHECKOUT_STEPS"
      :key="step.key"
      class="flex items-center gap-2 sm:gap-3.5"
    >
      <span class="inline-flex items-center gap-2">
        <span
          class="grid size-6 shrink-0 place-items-center rounded-pill font-mono text-[0.688rem] font-bold transition-colors"
          :class="
            index < activeIndex
              ? 'bg-success-DEFAULT text-white'
              : index === activeIndex
                ? 'bg-primary-500 text-white'
                : 'bg-surface-cream text-secondary-400'
          "
        >
          <!-- Los pasos hechos muestran un check, no su número: el número ya
               no aporta y el check confirma el avance. -->
          <svg
            v-if="index < activeIndex"
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5 L6.5 11.5 L12.5 5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span
          class="font-mono text-[0.688rem] tracking-[0.08em] uppercase"
          :class="index <= activeIndex ? 'text-secondary-900' : 'text-secondary-400'"
        >
          {{ step.label }}
        </span>
      </span>

      <span
        v-if="index < CHECKOUT_STEPS.length - 1"
        class="h-px w-5 sm:w-8"
        :class="index < activeIndex ? 'bg-success-DEFAULT' : 'bg-line'"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>
