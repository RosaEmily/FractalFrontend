<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import certificateService from "../services/certificate.service";
import type { Certificate } from "../models/certificate.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

/*
 * El listado mostraba solo código y fecha: no decía de quién ni de qué era cada
 * certificado, que es lo primero que se busca al entrar. El alumno va con su
 * documento debajo porque es su identificador real en el sistema.
 */
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
    field: "studentName",
    header: "Alumno",
    showFilterMenu: false,
    type: "custom",
    render: (row: Certificate) =>
      h(StackedCell, {
        primary: row.studentName ?? "—",
        secondary: row.studentDocument,
        plain: true,
      }),
  },
  {
    field: "subjectName",
    header: "Curso / Línea",
    showFilterMenu: false,
    type: "custom",
    render: (row: Certificate) =>
      h(StackedCell, {
        primary: row.subjectName ?? "—",
        secondary: row.templateName,
        mono: false,
        plain: true,
      }),
  },
  {
    field: "subjectTypeLabel",
    header: "Tipo",
    showFilterMenu: false,
    type: "custom",
    render: (row: Certificate) =>
      h(StatusPill, {
        label: row.subjectTypeLabel,
        // El diploma de línea es el caso excepcional: se distingue en color.
        tone: row.subjectType === "learning_path" ? "info" : "neutral",
        dot: false,
      }),
  },
  {
    field: "issuedDateLabel",
    header: "Emitido el",
    sortable: true,
    // El modelo usa camelCase pero el `order` viaja literal a la API.
    sortField: "issued_date",
    showFilterMenu: false,
    type: "custom",
    render: (row: Certificate) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.issuedDateLabel,
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
    sort-field="issued_date"
    :sort-order="-1"
  />
</template>
