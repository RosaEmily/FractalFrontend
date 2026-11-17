<script setup lang="ts">
/**
 * Campos compartidos de crear y editar una página informativa, con la vista
 * previa del contenido tal como lo ve el visitante.
 */
import { computed } from "vue";
import { InputTextCore, TextAreaCore, ToggleCore, LabelCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import { renderMarkdown } from "@/shared/utils/markdown";

interface Fields {
  title: { value: unknown };
  slug: { value: unknown };
  content: { value: unknown };
  published: { value: unknown };
}

const props = defineProps<{
  fields: Fields;
  errors: Record<string, string | undefined>;
}>();

const html = computed(() => renderMarkdown(props.fields.content.value as string | null));
const slugPreview = computed(() => (props.fields.slug.value as string | null) || "mi-pagina");
</script>

<template>
  <InputTextCore
    v-model="fields.title.value as string"
    label="Título"
    required
    placeholder="Política de privacidad"
    :invalid="!!errors.title"
    :message-error="errors.title"
  />
  <InputTextCore
    v-model="fields.slug.value as string"
    label="Dirección"
    required
    placeholder="politica-de-privacidad"
    :invalid="!!errors.slug"
    :message-error="errors.slug"
  />
  <p class="-mt-2 text-adm-sm text-secondary-400">
    Se publica en <span class="font-mono">/info/{{ slugPreview }}</span>. Solo minúsculas,
    números y guiones.
  </p>

  <TextAreaCore
    v-model="fields.content.value as string"
    label="Contenido"
    :rows="12"
    :invalid="!!errors.content"
    :message-error="errors.content"
  />
  <p class="-mt-2 text-adm-sm text-secondary-400">
    Formato: <span class="font-mono"># Título</span>, <span class="font-mono">## Subtítulo</span>,
    <span class="font-mono">- elemento de lista</span>,
    <span class="font-mono">**negrita**</span>,
    <span class="font-mono">[texto](https://enlace)</span>. Un renglón en blanco separa los párrafos.
  </p>

  <FieldPreview hint="así se ve en la web">
    <div class="w-full max-h-96 overflow-y-auto">
      <p class="font-display text-adm-xl font-bold text-secondary-900 mb-2">
        {{ (fields.title.value as string) || "Título de la página" }}
      </p>
      <!-- renderMarkdown escapa el HTML y solo deja pasar enlaces seguros -->
      <div
        class="text-adm-base text-secondary-500 space-y-2 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-secondary-900 [&_h2]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary-500 [&_a]:underline"
        v-html="html || '<p>Aquí aparecerá el contenido.</p>'"
      />
    </div>
  </FieldPreview>

  <div>
    <LabelCore
      text="Publicada"
      hint="Una página sin publicar no se ve en la web ni en el pie de página."
    />
    <ToggleCore v-model="fields.published.value as boolean" />
  </div>
</template>
