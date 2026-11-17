<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import faqService from "../services/faq.service";
import type { Faq } from "../models/faq.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Faq>[] = [
  {
    field: "question",
    header: "Pregunta",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "answer",
    header: "Respuesta",
    showFilterMenu: false,
    /*
     * Las respuestas son párrafos: en una celda de texto plano la columna se
     * estrechaba y la fila crecía a 15+ líneas en móvil. Se recorta a 3 líneas
     * con un ancho mínimo; el texto completo está en el título y en Editar.
     */
    type: "custom",
    render: (row: Faq) =>
      h(
        "p",
        {
          class: "min-w-64 line-clamp-3 text-adm-base text-secondary-500",
          title: row.answer,
        },
        row.answer,
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => faqService.list(params),
      delete: (ids: (number | string)[]) => faqService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Preguntas frecuentes"
    module="content/faqs"
  />
</template>
