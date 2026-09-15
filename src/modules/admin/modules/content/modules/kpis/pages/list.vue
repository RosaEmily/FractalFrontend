<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import kpiService from "../services/kpi.service";
import type { Kpi } from "../models/kpi.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Kpi>[] = [
  {
    field: "description",
    header: "Descripción",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "number",
    header: "Número",
    sortable: true,
    showFilterMenu: false,
  },
  {
    field: "format",
    header: "Formato",
    showFilterMenu: false,
  },
  {
    field: "preview",
    header: "Vista previa",
    showFilterMenu: false,
  },
];
</script>
<template>
  <!--
    Los recursos de landing viven en un JSON en S3: no tienen updated_at ni
    update-status. El borrado sí existe, vía bulk-delete.
  -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => kpiService.list(params),
      delete: (ids: (number | string)[]) => kpiService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="KPIs del home"
    module="content/kpis"
  />
</template>
