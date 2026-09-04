<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import finalGradeService from "../services/final-grade.service";
import type { FinalGrade } from "../models/final-grade.model";
import type { GridUiColumnProps } from "@/shared/components/type";

/*
 * Antes eran notas sueltas: "16.8 / Aprobado / 12-06" sin decir de quién ni de
 * qué curso.
 */
const columns: GridUiColumnProps<FinalGrade>[] = [
  {
    field: "studentName",
    header: "Estudiante",
    showFilterMenu: false,
    type: "custom",
    render: (row: FinalGrade) =>
      h(StackedCell, {
        primary: row.studentName ?? "—",
        secondary: row.studentDocument,
        plain: true,
      }),
  },
  {
    field: "courseName",
    header: "Curso / Programa",
    showFilterMenu: false,
    type: "custom",
    render: (row: FinalGrade) =>
      h(StackedCell, {
        primary: row.courseName ?? "—",
        secondary: row.offerName,
        mono: false,
        plain: true,
      }),
  },
  {
    field: "finalScore",
    header: "Nota final",
    sortable: true,
    sortField: "final_score",
    showFilterMenu: false,
    type: "custom",
    render: (row: FinalGrade) =>
      h(
        "span",
        { class: "font-mono text-adm-md font-semibold text-secondary-900" },
        row.finalScore !== null ? String(row.finalScore) : "—",
      ),
  },
  {
    field: "approved",
    header: "Resultado",
    showFilterMenu: false,
    type: "custom",
    render: (row: FinalGrade) =>
      h(StatusPill, {
        label: row.approved ? "Aprobado" : "Reprobado",
        tone: row.approved ? "success" : "danger",
      }),
  },
  {
    field: "calculatedAt",
    header: "Calculado el",
    sortable: true,
    sortField: "calculated_at",
    showFilterMenu: false,
    type: "custom",
    // El acta cerrada no se puede reabrir: conviene verlo en el listado.
    render: (row: FinalGrade) =>
      h("div", { class: "min-w-0" }, [
        h(
          "span",
          { class: "font-mono text-adm-sm text-secondary-500" },
          row.calculatedAt ?? "—",
        ),
        row.closedAt
          ? h(
              "div",
              { class: "font-mono text-adm-xs text-secondary-400 mt-0.5" },
              `acta cerrada ${row.closedAt}`,
            )
          : null,
      ]),
  },
];
</script>
<template>
  <!--
    Solo lectura, como manda el diseño: la nota final es `Σ(nota × peso / 100)`
    y la calcula el cierre de acta del aula. Con el formulario de crear/editar
    se podía escribir a mano una nota y marcar "Aprobado" saltándose el cálculo
    y la auditoría de quién cerró el acta.

    El borrado se conserva para poder rehacer un acta mal cerrada.
  -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => finalGradeService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        finalGradeService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => finalGradeService.delete(ids),
    }"
    :show-updated-at="false"
    :show-create="false"
    :show-edit="false"
    title="Notas finales"
    module="evaluations/final-grades"
  />
</template>
