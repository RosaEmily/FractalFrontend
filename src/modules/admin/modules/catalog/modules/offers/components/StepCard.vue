<script setup lang="ts">
/** Tarjeta numerada de un paso del alta de programa (`AdmCard` del diseño). */
defineProps<{ step: number | string; title: string }>();
</script>

<template>
  <section
    class="flex flex-col gap-3.5 rounded-adm-lg border border-line bg-surface-paper p-[1.375rem] shadow-sm"
  >
    <header class="flex items-center gap-2.5">
      <span
        class="grid size-[1.375rem] shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-adm-xs font-bold text-primary-600"
      >
        {{ step }}
      </span>
      <span
        class="font-mono text-adm-xs font-semibold uppercase tracking-[0.08em] text-secondary-400"
      >
        {{ title }}
      </span>
    </header>
    <slot />
  </section>
</template>
