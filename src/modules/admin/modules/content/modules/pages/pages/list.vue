<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import pageService from "../services/page.service";
import type { Page } from "../models/page.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Page>[] = [
  {
    field: "title",
    header: "Título",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Page) =>
      h("span", { class: "text-adm-base font-semibold text-secondary-900" }, row.title),
  },
  {
    field: "slug",
    header: "Dirección",
    showFilterMenu: false,
    type: "custom",
    render: (row: Page) =>
      h("span", { class: "font-mono text-adm-sm text-secondary-500" }, `/info/${row.slug}`),
  },
  {
    field: "published",
    header: "Estado",
    showFilterMenu: false,
    type: "custom",
    render: (row: Page) =>
      h(StatusPill, {
        label: row.published ? "Publicada" : "Borrador",
        tone: row.published ? "success" : "neutral",
      }),
  },
];
</script>
<template>
  <!-- Recurso de landing: JSON en S3, sin status ni updated_at. -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => pageService.list(params),
      delete: (ids: (number | string)[]) => pageService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Páginas"
    module="content/pages"
  />
</template>
