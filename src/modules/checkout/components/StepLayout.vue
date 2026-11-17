<script setup lang="ts">
import LandingEyebrow from "@/modules/landing/components/ui/LandingEyebrow.vue";
import LandingImage from "@/modules/landing/components/ui/LandingImage.vue";
import CheckoutSummary from "./CheckoutSummary.vue";
import { useCartStore } from "../stores/useCartStore";
import { formatMoney } from "../utils/money";

defineProps<{
  index: number;
  eyebrow: string;
  title: string;
  sub?: string;
}>();

defineEmits<{ back: [] }>();

const cart = useCartStore();
</script>

<template>
  <button
    type="button"
    class="mb-[1.375rem] inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-secondary-500 transition-colors hover:text-secondary-900"
    @click="$emit('back')"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    Volver
  </button>

  <div class="grid grid-cols-1 items-start gap-10 min-[900px]:grid-cols-[1.55fr_1fr]">
    <section class="order-1 min-w-0 min-[900px]:order-0">
      <LandingEyebrow :index="index">{{ eyebrow }}</LandingEyebrow>
      <h1 class="mt-3.5 font-display text-[1.875rem] leading-[1.1] font-bold tracking-[-0.02em] text-secondary-900 sm:text-[2.5rem]">
        {{ title }}
      </h1>
      <p v-if="sub" class="mt-2.5 max-w-135 text-[0.969rem] leading-normal text-secondary-500">
        {{ sub }}
      </p>

      <div class="mt-[1.875rem]">
        <slot />
      </div>

    </section>

    <!-- En una columna el pedido va ARRIBA, como en el diseño. -->
    <aside class="order-0 min-w-0 min-[900px]:sticky min-[900px]:-top-5 min-[900px]:order-1">
      <div class="rounded-adm-lg border border-line bg-surface-paper p-6 shadow-md">
        <p class="mb-4 font-mono text-[0.688rem] tracking-[0.08em] text-secondary-400 uppercase">Tu pedido</p>
        <ul class="mb-[1.125rem] flex flex-col gap-3">
          <li v-for="item in cart.items" :key="item.offerId" class="flex items-center gap-3">
            <LandingImage
              :src="item.imageUrl"
              :alt="`Imagen de ${item.name}`"
              :fallback-text="item.prefix"
              img-class="size-[2.875rem] shrink-0 rounded-adm-sm border border-line object-cover"
              :fallback-class="`grid size-[2.875rem] shrink-0 place-items-center rounded-adm-sm border border-line font-mono text-[0.438rem] text-secondary-400 ${item.isPath ? 'bg-accent-soft' : 'bg-surface-cream'}`"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-[0.844rem] leading-tight font-semibold text-secondary-900">{{ item.name }}</p>
              <p class="mt-0.5 font-mono text-[0.656rem] text-secondary-400">{{ item.kind }}</p>
            </div>
            <span class="font-display text-[0.938rem] font-bold whitespace-nowrap text-secondary-900">
              {{ formatMoney(item.price) }}
            </span>
          </li>
        </ul>
        <CheckoutSummary dense />
      </div>
    </aside>
  </div>
</template>
