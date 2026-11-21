<script setup lang="ts">
/**
 * Tarjeta de una sección de reporte (gráfico o desglose), con el mismo marco
 * que la tabla principal. Con `loading` dibuja un esqueleto del alto del contenido.
 */
defineProps<{
  title: string;
  hint?: string;
  loading?: boolean;
}>();
</script>

<template>
  <section
    class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm"
  >
    <header class="px-5.5 pt-4 pb-3 border-b border-line-soft">
      <h3
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
      >
        {{ title }}
      </h3>
      <p v-if="hint" class="text-adm-sm text-secondary-400 mt-0.5">{{ hint }}</p>
    </header>

    <div v-if="loading" class="px-5.5 py-4.5" aria-busy="true" :aria-label="`Cargando ${title}`">
      <span class="adm-skeleton block h-3.5 w-1/3 rounded-[0.313rem]" />
      <span class="adm-skeleton block h-28 w-full rounded-adm-sm mt-3.5" />
    </div>
    <div v-else class="pb-4"><slot /></div>
  </section>
</template>
