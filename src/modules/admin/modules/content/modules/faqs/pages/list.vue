<script setup lang="ts">
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
