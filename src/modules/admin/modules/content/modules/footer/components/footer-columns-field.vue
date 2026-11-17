<script setup lang="ts">
/**
 * Editor de las columnas de enlaces del pie.
 *
 * `CrudForm` no maneja arrays anidados, así que las columnas viven en un `ref`
 * de la página y se inyectan al guardar (mismo patrón que `OfferCoursesField`).
 * La columna de Contacto no se edita acá: sale de Sitio web → Contactos.
 */
import { mdiPlus } from "@mdi/js";
import { ButtonCore, InputTextCore, SelectCore } from "@/shared/components";
import type { FooterColumnDTO, FooterLinkDTO, FooterLinkType } from "../dto/footer.dto";

const MAX_COLUMNS = 3;
const MAX_LINKS = 10;

const columns = defineModel<FooterColumnDTO[]>({ required: true });

defineProps<{
  pageOptions: { slug: string; title: string }[];
  /** Mensaje de la última validación, por `columna-enlace` o `columna`. */
  errors: Record<string, string>;
}>();

const TYPE_OPTIONS: { value: FooterLinkType; label: string }[] = [
  { value: "page", label: "Una página del sitio" },
  { value: "url", label: "Una dirección externa" },
  { value: "faqs", label: "Preguntas frecuentes" },
];

const addColumn = () => {
  if (columns.value.length >= MAX_COLUMNS) return;
  columns.value = [...columns.value, { title: "", links: [] }];
};
const removeColumn = (index: number) => {
  columns.value = columns.value.filter((_, i) => i !== index);
};
const addLink = (column: FooterColumnDTO) => {
  if (column.links.length >= MAX_LINKS) return;
  const link: FooterLinkDTO = { label: "", type: "page", page: null, url: null };
  column.links = [...column.links, link];
};
const removeLink = (column: FooterColumnDTO, index: number) => {
  column.links = column.links.filter((_, i) => i !== index);
};
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="text-adm-md font-semibold text-secondary-900">Columnas de enlaces</p>
      <p class="text-adm-sm text-secondary-400">
        Hasta {{ MAX_COLUMNS }} columnas, de {{ MAX_LINKS }} enlaces cada una. La columna de
        Contacto se arma sola con Sitio web → Contactos.
      </p>
    </div>

    <p
      v-if="!columns.length"
      class="text-adm-base text-secondary-400 border border-dashed border-line rounded-adm-md px-4 py-5"
    >
      Todavía no hay columnas. El pie solo muestra marca, contacto y redes.
    </p>

    <div
      v-for="(column, columnIndex) in columns"
      :key="columnIndex"
      class="border border-line rounded-adm-md bg-admin-bg p-4 space-y-3"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1 min-w-0">
          <InputTextCore
            v-model="column.title"
            label="Título de la columna"
            placeholder="Información"
            :invalid="!!errors[`${columnIndex}`]"
            :message-error="errors[`${columnIndex}`]"
          />
        </div>
        <ButtonCore
          class="!w-auto mt-6 shrink-0"
          severity="danger"
          text
          label="Quitar columna"
          @click="removeColumn(columnIndex)"
        />
      </div>

      <div
        v-for="(link, linkIndex) in column.links"
        :key="linkIndex"
        class="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start"
      >
        <InputTextCore
          v-model="link.label"
          label="Texto"
          placeholder="Política de privacidad"
          :invalid="!!errors[`${columnIndex}-${linkIndex}`]"
          :message-error="errors[`${columnIndex}-${linkIndex}`]"
        />
        <SelectCore
          v-model="link.type"
          label="Lleva a"
          :options="TYPE_OPTIONS"
          option-label="label"
          option-value="value"
        />
        <SelectCore
          v-if="link.type === 'page'"
          v-model="link.page"
          label="Página"
          :options="pageOptions"
          option-label="title"
          option-value="slug"
          placeholder="Elige una página"
        />
        <InputTextCore
          v-else-if="link.type === 'url'"
          v-model="link.url"
          label="Dirección"
          placeholder="https://..."
        />
        <p v-else class="text-adm-sm text-secondary-400 md:mt-8">
          Baja hasta las preguntas de la página de Contacto.
        </p>
        <ButtonCore
          class="!w-auto md:mt-6"
          severity="danger"
          text
          label="Quitar"
          @click="removeLink(column, linkIndex)"
        />
      </div>

      <ButtonCore
        v-if="column.links.length < MAX_LINKS"
        class="!w-auto"
        severity="secondary"
        outlined
        size="small"
        label="Agregar enlace"
        @click="addLink(column)"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" class="size-4 fill-current"><path :d="mdiPlus" /></svg>
        </template>
      </ButtonCore>
    </div>

    <ButtonCore
      v-if="columns.length < MAX_COLUMNS"
      class="!w-auto"
      severity="secondary"
      outlined
      size="small"
      label="Agregar columna"
      @click="addColumn"
    />
  </div>
</template>
