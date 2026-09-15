<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import courseEvaluationService from "../services/course-evaluation.service";
import type { CourseEvaluation } from "../models/course-evaluation.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<CourseEvaluation>[] = [
  {
    field: "name",
    header: "Evaluación",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: CourseEvaluation) =>
      h("span", { class: "text-adm-base font-bold text-secondary-900" }, row.name),
  },
  {
    field: "weight",
    header: "Peso",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: CourseEvaluation) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-900" },
        `${row.weight}%`,
      ),
  },
  {
    field: "maxScore",
    header: "Nota máxima",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: CourseEvaluation) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        String(row.maxScore),
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => courseEvaluationService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        courseEvaluationService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => courseEvaluationService.delete(ids),
    }"
    :show-updated-at="false"
    title="Evaluaciones"
    module="evaluations/course-evaluations"
  />
</template>
