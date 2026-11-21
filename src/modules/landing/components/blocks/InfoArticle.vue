<script setup lang="ts">
/**
 * Título y cuerpo de una página informativa/legal. Lo usan `InfoPageView` y la
 * vista previa del panel (Sitio web → Páginas). `html` ya viene saneado por
 * `renderMarkdown` (escapa HTML y solo deja enlaces seguros).
 */
defineProps<{ title: string; html: string }>();
defineEmits<{ (e: "content-click", event: MouseEvent): void }>();
</script>

<template>
  <article>
    <h1 class="font-display font-bold text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-tight text-secondary-900 text-balance mb-8">
      {{ title }}
    </h1>
    <div
      class="font-body text-[1rem] leading-relaxed text-secondary-600 space-y-4 [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:text-secondary-900 [&_h2]:mt-8 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-secondary-900 [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:text-primary-500 [&_a]:underline [&_strong]:text-secondary-900"
      @click="$emit('content-click', $event)"
      v-html="html"
    />
  </article>
</template>
