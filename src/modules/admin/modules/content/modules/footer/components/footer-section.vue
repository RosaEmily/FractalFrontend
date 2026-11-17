<script setup lang="ts">
/** Bloque con título y ayuda para ordenar la pantalla del pie en secciones. */
defineProps<{ id: string; step: number; title: string; description?: string }>();
</script>

<template>
  <section
    :id="id"
    class="scroll-mt-24 border border-line rounded-adm-md bg-white p-5 space-y-4"
  >
    <header class="flex items-start gap-3">
      <span
        class="size-7 shrink-0 rounded-full bg-primary-500 text-white text-adm-sm font-semibold flex items-center justify-center"
      >{{ step }}</span>
      <div>
        <h2 class="text-adm-md font-semibold text-secondary-900">{{ title }}</h2>
        <p v-if="description" class="text-adm-sm text-secondary-400">{{ description }}</p>
      </div>
    </header>
    <slot />
  </section>
</template>
