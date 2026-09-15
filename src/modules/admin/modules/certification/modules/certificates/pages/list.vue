<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import certificateService from "../services/certificate.service";
import type { Certificate } from "../models/certificate.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Certificate>[] = [
  {
    field: "code",
    header: "Código",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Certificate) =>
      h(
        "span",
        { class: "font-mono text-adm-sm font-bold text-primary-600" },
        row.code,
      ),
  },
  {
    field: "issuedDate",
    header: "Emitido el",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Certificate) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.issuedDate ?? "—",
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => certificateService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        certificateService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => certificateService.delete(ids),
    }"
    :show-updated-at="false"
    title="Certificaciones"
    module="certification/certificates"
  />
</template>
