<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import { mdiCreation } from "@mdi/js";

withDefaults(
  defineProps<{
    title: string;
    /** Un estado vacío redactado comunica más que una tabla en blanco. */
    sub?: string;
    icon?: string;
  }>(),
  { icon: mdiCreation },
);
</script>

<template>
  <!--
    Sin tarjeta ni borde: el vacío no es un contenedor con contenido ausente,
    es un mensaje. Un recuadro grande y vacío pesa más de lo que dice.
  -->
  <div class="flex flex-col items-center text-center px-6 py-15 gap-2">
    <span
      class="size-16 rounded-pill bg-accent-soft text-primary-500 inline-flex items-center justify-center mb-2"
    >
      <HeroCore :path="icon" class="size-7" />
    </span>
    <p class="font-display text-xl font-bold text-secondary-900 tracking-tight">
      {{ title }}
    </p>
    <p v-if="sub" class="text-adm-base text-secondary-500 max-w-95">
      {{ sub }}
    </p>
    <div v-if="$slots.default" class="mt-3"><slot /></div>
  </div>
</template>
