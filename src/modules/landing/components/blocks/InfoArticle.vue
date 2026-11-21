<script setup lang="ts">
/**
 * Título y cuerpo de una página informativa/legal. Lo usan `InfoPageView` y la
 * vista previa del panel (Sitio web → Páginas). `html` ya viene saneado por
 * `toRichHtml` (lista blanca de etiquetas, estilos y enlaces).
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
      class="font-body text-[1rem] leading-relaxed text-secondary-600 space-y-4 [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:text-secondary-900 [&_h2]:mt-8 [&_h3]:font-display [&_h3]:text-[1.25rem] [&_h3]:font-bold [&_h3]:text-secondary-900 [&_h3]:mt-6 [&_h4]:font-display [&_h4]:font-bold [&_h4]:text-secondary-900 [&_h4]:mt-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.9375rem] [&_th]:border [&_th]:border-line [&_th]:bg-surface-page [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-secondary-900 [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_td>p]:m-0 [&_th>p]:m-0 [&_hr]:border-line [&_hr]:my-8 [&_a]:text-primary-500 [&_a]:underline [&_strong]:text-secondary-900"
      @click="$emit('content-click', $event)"
      v-html="html"
    />
  </article>
</template>
