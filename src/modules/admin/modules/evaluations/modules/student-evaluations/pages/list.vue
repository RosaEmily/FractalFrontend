<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import studentEvaluationService from "../services/student-evaluation.service";
import type { StudentEvaluation } from "../models/student-evaluation.model";
import type { GridUiColumnProps } from "@/shared/components/type";

/*
 * Antes el listado era una columna de números sin sujeto: no decía de qué
 * alumno era la nota ni a qué evaluación correspondía.
 */
const columns: GridUiColumnProps<StudentEvaluation>[] = [
  {
    field: "studentName",
    header: "Estudiante",
    showFilterMenu: false,
    type: "custom",
    render: (row: StudentEvaluation) =>
      h(StackedCell, {
        primary: row.studentName ?? "—",
        secondary: row.studentDocument,
        plain: true,
      }),
  },
  {
    field: "evaluationName",
    header: "Evaluación",
    showFilterMenu: false,
    type: "custom",
    render: (row: StudentEvaluation) =>
      h(StackedCell, {
        primary: row.evaluationName ?? "—",
        secondary: row.courseName,
        mono: false,
        plain: true,
      }),
  },
  {
    field: "score",
    header: "Nota",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    // La nota sola no dice si 17 es mucho o poco: va sobre su puntaje máximo.
    render: (row: StudentEvaluation) =>
      row.score !== null
        ? h("span", { class: "font-mono text-adm-md text-secondary-900" }, [
            h("span", { class: "font-semibold" }, String(row.score)),
            row.maxScore !== null
              ? h(
                  "span",
                  { class: "text-adm-sm text-secondary-400" },
                  ` / ${row.maxScore}`,
                )
              : null,
          ])
        : h("span", { class: "text-secondary-400" }, "—"),
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
    sortField: "evaluated_at",
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
