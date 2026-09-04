<script setup lang="ts">
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import CheckoutSummary from "./CheckoutSummary.vue";

defineProps<{
  eyebrow: string;
  title: string;
  sub?: string;
  primary?: string;
  primaryDisabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{ back: []; primary: [] }>();
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
    <section>
      <button
        type="button"
        class="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-[0.813rem] font-medium text-secondary-500 transition-colors hover:text-secondary-900"
        @click="$emit('back')"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Volver
      </button>

      <p class="font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">
        {{ eyebrow }}
      </p>
      <h1 class="mt-1.5 font-display text-3xl font-bold tracking-tight text-secondary-900">
        {{ title }}
      </h1>
      <p v-if="sub" class="mt-2 text-[0.906rem] leading-relaxed text-secondary-500">
        {{ sub }}
      </p>

      <div class="mt-7">
        <slot />
      </div>

      <LandingButton
        v-if="primary"
        variant="primary"
        size="lg"
        class="mt-7 w-full justify-center sm:w-auto"
        :class="primaryDisabled || loading ? 'pointer-events-none opacity-55' : ''"
        @click="$emit('primary')"
      >
        {{ loading ? "Procesando…" : primary }}
      </LandingButton>
    </section>

    <aside class="lg:sticky lg:top-28">
      <CheckoutSummary :footnote="true" />
    </aside>
  </div>
</template>
