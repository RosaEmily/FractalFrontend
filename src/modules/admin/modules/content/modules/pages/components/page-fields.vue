<script setup lang="ts">
/**
 * Campos compartidos de crear y editar una página informativa, con la vista
 * previa del contenido tal como lo ve el visitante.
 */
import { computed } from "vue";
import { InputTextCore, TextAreaCore, ToggleCore, LabelCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import LandingFrame from "../../../components/landing-frame.vue";
import InfoArticle from "@/modules/landing/components/blocks/InfoArticle.vue";
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
    <LandingFrame :width="1100">
      <section class="bg-surface-page px-16 py-16">
        <div class="max-w-3xl mx-auto">
          <InfoArticle
            :title="(fields.title.value as string) || 'Título de la página'"
            :html="html || '<p>Aquí aparecerá el contenido.</p>'"
          />
        </div>
      </section>
    </LandingFrame>
  </FieldPreview>

  <div>
    <LabelCore
      text="Publicada"
      hint="Una página sin publicar no se ve en la web ni en el pie de página."
    />
    <ToggleCore v-model="fields.published.value as boolean" />
  </div>
</template>
