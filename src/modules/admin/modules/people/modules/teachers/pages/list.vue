<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import AvatarCell from "@/modules/admin/components/ui/avatar-cell.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import FavoriteCell from "@/modules/admin/components/ui/favorite-cell.vue";
import teacherService from "../services/teacher.service";
import type { Teacher } from "../models/teacher.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Teacher>[] = [
  {
    field: "full_name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // Avatar con iniciales dentro de la celda, como en el diseño.
    type: "custom",
    render: (row: Teacher) =>
      h(AvatarCell, { name: row.full_name, photo: row.photo_url }),
  },
  {
    field: "documentLabel",
    header: "Documento",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Teacher) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.documentLabel || "—",
      ),
  },
  {
    field: "specialty",
    header: "Especialidad",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "email",
    header: "Contacto",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // Correo y teléfono en una sola celda, como en el diseño.
    type: "custom",
    render: (row: Teacher) =>
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
    render: (row: Teacher) => h(FavoriteCell, { favorite: row.is_favorite }),
  },
];
</script>
<template>
  <!--
    Sin ruta de creación: la API expone teachers con `except: ['create']`;
    un instructor nace al registrar un usuario con rol TEACHER.
  -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => teacherService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        teacherService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => teacherService.delete(ids),
    }"
    :show-updated-at="false"
    title="Lista de instructores"
    module="people/teachers"
  />
</template>
