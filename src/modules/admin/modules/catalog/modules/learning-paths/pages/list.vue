<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import learningPathService from "../services/learning-path.service";
import courseService from "../../courses/services/course.service";
import type { LearningPath } from "../models/learning-path.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<LearningPath>[] = [
  {
    field: "name",
    header: "Línea de carrera",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    // La descripción va como segunda línea, no como columna propia.
    type: "custom",
    render: (row: LearningPath) =>
      h(StackedCell, {
        primary: row.name,
        secondary: row.description,
        mono: false,
      }),
  },
  {
    field: "courses",
    header: "Cursos (en orden)",
    showFilterMenu: false,
    showFilterMatchModes: false,
    // El número comunica el orden de desbloqueo; se muestran todos.
    chipNumbered: true,
    maxVisible: 99,
    filter: { value: null, matchMode: FilterMatchMode.IN },
    filterConfig: {
      component: "multiselect",
      multiselectProps: {
        filter: true,
        optionLabel: "name",
        optionValue: "id",
        placeholder: "Ingrese cursos",
        service: () => courseService.all(),
        autoLoad: true,
      },
    },
  },
  {
    field: "price",
    header: "Precio",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: LearningPath) =>
      h(
        "span",
        { class: "font-mono text-adm-md font-semibold text-secondary-900" },
        row.price ?? "—",
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => learningPathService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        learningPathService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => learningPathService.delete(ids),
    }"
    :show-updated-at="false"
    title="Lista de líneas de carrera"
    module="catalog/learning-paths"
  />
</template>
