<script setup lang="ts">
import { computed } from "vue";
import { CHECKOUT_STEPS, type CheckoutStep } from "../constants/steps";

const props = withDefaults(
  defineProps<{ current: CheckoutStep; loggedIn?: boolean; compact?: boolean }>(),
  { loggedIn: false, compact: false },
);

/** Con sesión de aula no hay nada que pedir en "Cuenta": el paso desaparece. */
const steps = computed(() =>
  props.loggedIn ? CHECKOUT_STEPS.filter((s) => s.key !== "auth") : CHECKOUT_STEPS,
);

/*
 * `method` y `card` son dos pantallas pero UN paso para el usuario: la barra
 * marcaría un avance que no ocurrió al elegir el método y volver a pagar.
 */
const activeIndex = computed(() => {
  const key = props.current === "card" ? "method" : props.current;
  return steps.value.findIndex((s) => s.key === key);
});

/** Versión móvil: sin etiquetas, así que el paso actual se dice en texto debajo. */
const caption = computed(
  () =>
    `Paso ${activeIndex.value + 1} de ${steps.value.length} · ${steps.value[activeIndex.value]?.label ?? ""}`,
);
</script>

<template>
  <div class="flex flex-col items-center gap-1">
  <ol class="flex items-center" :class="compact ? 'gap-2' : 'flex-wrap gap-3.5'">
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="flex items-center"
      :class="compact ? 'gap-2' : 'gap-3.5'"
    >
      <span class="inline-flex items-center gap-2.5">
        <span
          class="grid shrink-0 place-items-center rounded-pill border-[1.5px] font-mono font-bold transition-colors"
          :class="[
            compact ? 'size-5 text-[0.625rem]' : 'size-7 text-xs',
            index < activeIndex
              ? 'border-primary-500 bg-primary-500 text-white'
              : index === activeIndex
                ? 'border-secondary-900 bg-secondary-900 text-white'
                : 'border-line bg-surface-paper text-secondary-400',
          ]"
        >
          <!-- Los pasos hechos muestran un check, no su número: el número ya
               no aporta y el check confirma el avance. -->
          <svg
            v-if="index < activeIndex"
            :width="compact ? 10 : 14"
            :height="compact ? 10 : 14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5 L6.5 11.5 L12.5 5"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span
          v-if="!compact"
          class="font-mono text-[0.719rem] font-semibold tracking-[0.08em] uppercase"
          :class="
            index < activeIndex
              ? 'text-primary-600'
              : index === activeIndex
                ? 'text-secondary-900'
                : 'text-secondary-400'
          "
        >
          {{ step.label }}
        </span>
      </span>

      <span
        v-if="index < steps.length - 1"
        class="h-0.5 rounded-pill"
        :class="[compact ? 'w-[1.125rem]' : 'w-9', index < activeIndex ? 'bg-primary-500' : 'bg-line']"
        aria-hidden="true"
      />
    </li>
  </ol>
  <p v-if="compact" class="font-mono text-[0.563rem] tracking-[0.1em] whitespace-nowrap text-secondary-400 uppercase">
    {{ caption }}
  </p>
  </div>
</template>
