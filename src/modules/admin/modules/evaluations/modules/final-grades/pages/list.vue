<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import finalGradeService from "../services/final-grade.service";
import type { FinalGrade } from "../models/final-grade.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const columns: GridUiColumnProps<FinalGrade>[] = [
  {
    field: "finalScore",
    header: "Nota final",
    sortable: true,
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
    showFilterMenu: false,
    type: "custom",
    render: (row: FinalGrade) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.calculatedAt ?? "—",
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => finalGradeService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        finalGradeService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => finalGradeService.delete(ids),
    }"
    :show-updated-at="false"
    title="Notas finales"
    module="evaluations/final-grades"
  />
</template>
