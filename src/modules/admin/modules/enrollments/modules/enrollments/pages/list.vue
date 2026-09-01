<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import PaymentCell from "../components/payment-cell.vue";
import enrollmentService from "../services/enrollment.service";
import type { Enrollment } from "../models/enrollment.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Enrollment>[] = [
  {
    field: "studentName",
    header: "Estudiante",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Enrollment) =>
      h(StackedCell, { primary: row.studentName, secondary: row.studentId }),
  },
  {
    field: "courseNames",
    header: "Ítems",
    showFilterMenu: false,
    // Cursos de la matrícula, sin truncar.
    maxVisible: 99,
  },
  {
    field: "enrollmentDate",
    header: "Fecha",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Enrollment) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.enrollmentDate,
      ),
  },
  {
    field: "amountFormat",
    header: "Total",
    showFilterMenu: false,
    type: "custom",
    render: (row: Enrollment) =>
      h(
        "span",
        { class: "font-mono text-adm-md font-semibold text-secondary-900" },
        row.amountFormat,
      ),
  },
  {
    field: "paymentStatus",
    header: "Pago",
    showFilterMenu: false,
    type: "custom",
    render: (row: Enrollment) => h(PaymentCell, { row }),
  },
];
</script>
<template>
  <!--
    Solo lectura: `store` de la API está restringido a STUDENT porque
    matricula al usuario del token, y no expone update.
  -->
  <SectionList
    :columns="columns"
    :services="{ list: (params: unknown) => enrollmentService.list(params) }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    :show-updated-at="false"
    title="Lista de matrículas"
    module="enrollments/enrollments"
  />
</template>
