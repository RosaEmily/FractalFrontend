<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import studentEvaluationService from "../services/student-evaluation.service";
import type { StudentEvaluation } from "../models/student-evaluation.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const columns: GridUiColumnProps<StudentEvaluation>[] = [
  {
    field: "score",
    header: "Nota",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: StudentEvaluation) =>
      h(
        "span",
        { class: "font-mono text-adm-md font-semibold text-secondary-900" },
        row.score !== null ? String(row.score) : "—",
      ),
  },
  {
    field: "feedback",
    header: "Retroalimentación",
    showFilterMenu: false,
  },
  {
    field: "evaluatedAt",
    header: "Evaluado el",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: StudentEvaluation) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.evaluatedAt ?? "—",
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => studentEvaluationService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        studentEvaluationService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => studentEvaluationService.delete(ids),
    }"
    :show-updated-at="false"
    title="Notas"
    module="evaluations/student-evaluations"
  />
</template>
