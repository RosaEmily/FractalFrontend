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
    /*
     * Sin `sortable`: el nombre vive en `users`, no en `enrollments`, así que
     * el `order` que enviaba esta cabecera (`studentName`) hacía fallar la
     * consulta con "Unknown column". Ordenar por alumno exige un join en la
     * API; hasta entonces, mejor sin cabecera que con una que rompe.
     */
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
    sortField: "enrollment_date",
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

    `module` es el PATH real de la ruta: el router monta este grupo bajo
    `academic`, no `enrollments`.
  -->
  <SectionList
    :columns="columns"
    :services="{ list: (params: unknown) => enrollmentService.list(params) }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    :show-edit="false"
    :show-updated-at="false"
    title="Lista de matrículas"
    module="academic/enrollments"
  />
</template>
