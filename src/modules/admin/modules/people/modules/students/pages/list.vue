<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import AvatarCell from "@/modules/admin/components/ui/avatar-cell.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import FavoriteCell from "@/modules/admin/components/ui/favorite-cell.vue";
import studentService from "../services/student.service";
import type { Student } from "../models/student.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";
import { CAREER_OPTIONS } from "@/modules/admin/constants/options";

const columns: GridUiColumnProps<Student>[] = [
  {
    field: "full_name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Student) =>
      h(AvatarCell, { name: row.full_name, photo: row.photo_url }),
  },
  {
    field: "documentLabel",
    header: "Documento",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Student) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.documentLabel || "—",
      ),
  },
  {
    field: "career_name",
    header: "Carrera",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "label",
        placeholder: "Selecciona una carrera",
        options: CAREER_OPTIONS,
      },
    },
  },
  {
    field: "email",
    header: "Contacto",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // Correo y teléfono juntos, como en el diseño.
    type: "custom",
    render: (row: Student) =>
      h(StackedCell, {
        primary: row.email,
        secondary: row.phone,
        plain: true,
      }),
  },
  {
    field: "is_favorite",
    header: "Destacado",
    showFilterMenu: false,
    type: "custom",
    render: (row: Student) => h(FavoriteCell, { favorite: row.is_favorite }),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => studentService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        studentService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => studentService.delete(ids),
    }"
    :show-updated-at="false"
    title="Lista de estudiantes"
    module="people/students"
  />
</template>
