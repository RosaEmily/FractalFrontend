<script setup lang="ts">
import SectionList from "@/modules/admin/components/Section/list.vue";
import evaluationTypeService from "../services/evaluation-type.service";
import type { EvaluationType } from "../models/evaluation-type.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<EvaluationType>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "description",
    header: "Descripción",
    showFilterMenu: false,
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => evaluationTypeService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        evaluationTypeService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => evaluationTypeService.delete(ids),
    }"
    title="Tipos de evaluación"
    module="evaluations/evaluation-types"
  />
</template>
