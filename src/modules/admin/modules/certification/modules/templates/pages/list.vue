<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import templateService from "../services/template.service";
import type { CertificateTemplate } from "../models/template.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<CertificateTemplate>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: CertificateTemplate) =>
      h("span", { class: "text-adm-base font-bold text-secondary-900" }, row.name),
  },
  {
    field: "backgroundImage",
    header: "Fondo",
    type: "image",
    showFilterMenu: false,
    image: { fit: "contain", class: "h-10 w-auto max-w-24" },
  },
  {
    field: "fontFamily",
    header: "Fuente",
    sortable: true,
    showFilterMenu: false,
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => templateService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        templateService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => templateService.delete(ids),
    }"
    :show-updated-at="false"
    title="Plantillas de certificado"
    module="certification/templates"
  />
</template>
