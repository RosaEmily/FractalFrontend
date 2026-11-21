<script setup lang="ts">
/**
 * Campos compartidos de crear y editar una página informativa, con la vista
 * previa del contenido tal como lo ve el visitante.
 */
import { computed, defineAsyncComponent } from "vue";
import { InputTextCore, ToggleCore, LabelCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import LandingFrame from "../../../components/landing-frame.vue";
import InfoArticle from "@/modules/landing/components/blocks/InfoArticle.vue";
import { toRichHtml } from "@/shared/utils/rich-text";

// El editor (Tiptap/ProseMirror, ~150 KB gzip) se descarga solo al abrir este formulario.
const RichTextCore = defineAsyncComponent(() => import("@/shared/components/core/rich-text/index.vue"));

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

const html = computed(() => toRichHtml(props.fields.content.value as string | null));
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

  <RichTextCore
    v-model="fields.content.value as string"
    label="Contenido"
    :min-height="260"
    :invalid="!!errors.content"
    :message-error="errors.content"
  />
  <p class="-mt-2 text-adm-sm text-secondary-400">
    Los enlaces pueden ser <span class="font-mono">https://…</span>,
    <span class="font-mono">mailto:</span>, <span class="font-mono">tel:</span> o una ruta del
    sitio como <span class="font-mono">/contact</span>. El contenido se limpia al guardar:
    solo se conserva el formato de la barra.
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
