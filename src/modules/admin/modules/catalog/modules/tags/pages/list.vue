<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import tagService from "../services/tag.service";
import type { Tag } from "../models/tag.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Tag>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Tag) =>
      h(
        "span",
        { class: "text-adm-base font-bold text-secondary-900" },
        row.name,
      ),
  },
  {
    field: "slug",
    header: "Slug",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Tag) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.slug,
      ),
  },
  {
    field: "coursesCount",
    header: "Cursos",
    showFilterMenu: false,
    type: "custom",
    render: (row: Tag) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-900" },
        String(row.coursesCount),
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => tagService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        tagService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => tagService.delete(ids),
    }"
    title="Etiquetas"
    module="catalog/tags"
  />
</template>
