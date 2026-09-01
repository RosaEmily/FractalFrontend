<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import courseService from "../services/course.service";
import tagService from "../../tags/services/tag.service";
import type { Course } from "../models/course.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Course>[] = [
  {
    field: "name",
    header: "Curso",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    type: "custom",
    render: (row: Course) =>
      h("span", { class: "text-adm-base font-bold text-secondary-900" }, row.name),
  },
  {
    field: "description",
    header: "Descripción",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "tags",
    header: "Etiquetas",
    showFilterMenu: false,
    showFilterMatchModes: false,
    // El diseño usa chip neutro para etiquetas y muestra todas.
    chipTone: "neutral",
    maxVisible: 99,
    filter: { value: null, matchMode: FilterMatchMode.IN },
    filterConfig: {
      component: "multiselect",
      multiselectProps: {
        filter: true,
        optionLabel: "name",
        optionValue: "id",
        placeholder: "Ingrese tags",
        service: () => tagService.all(),
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
    render: (row: Course) =>
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
      list: (params: unknown) => courseService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        courseService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => courseService.delete(ids),
    }"
    :show-updated-at="false"
    title="Lista de cursos"
    module="catalog/courses"
  />
</template>
