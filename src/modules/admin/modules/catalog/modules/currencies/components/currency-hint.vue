<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import { mdiAutoFix } from "@mdi/js";
import type { CurrencyCountry } from "../models/currency.model";

/**
 * Panel del diseño que muestra los datos que se autocompletan al elegir el
 * país: código, símbolo y número ISO no se editan a mano.
 */
defineProps<{ selected: CurrencyCountry | null }>();
</script>

<template>
  <div
    v-if="selected"
    class="my-1 mb-5 px-4.5 py-4 bg-accent-soft rounded-adm-md flex items-center gap-6 flex-wrap"
  >
    <HeroCore :path="mdiAutoFix" class="size-4 text-primary-500 shrink-0" />

    <div v-for="item in [
        { label: 'Código', value: selected.code },
        { label: 'Símbolo', value: selected.symbol },
        { label: 'Número ISO', value: String(selected.isoNumber) },
      ]"
      :key="item.label"
    >
      <div
        class="font-mono text-adm-xs text-primary-600 tracking-wider uppercase opacity-80"
      >
        {{ item.label }}
      </div>
      <div class="font-display text-base font-bold text-primary-600 mt-0.5">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>
