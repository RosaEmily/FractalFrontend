<script setup lang="ts">
import { mdiShieldCheckOutline } from "@mdi/js";
import { HeroCore } from "@/shared/components";
</script>

<template>
  <div
    class="flex gap-3.5 rounded-adm-lg border border-success-DEFAULT/22 bg-success-soft p-5"
  >
    <span
      class="grid size-10 shrink-0 place-items-center rounded-pill bg-surface-paper text-success-DEFAULT"
    >
      <HeroCore :path="mdiShieldCheckOutline" class="size-5" />
    </span>
    <div>
      <p class="font-display text-[0.969rem] font-bold text-secondary-900">
        Garantía de 7 días
      </p>
      <p class="mt-0.5 text-[0.813rem] leading-relaxed text-secondary-700">
        Si en la primera semana el programa no es para ti, te devolvemos el
        100%. Sin preguntas.
      </p>
    </div>
  </div>
</template>
