<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import classSessionService from "../services/class-session.service";
import type { ClassSession } from "../models/class-session.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<ClassSession>[] = [
  {
    field: "name",
    header: "Clase",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: ClassSession) =>
      h(StackedCell, {
        primary: row.name,
        secondary: row.topic,
        mono: false,
      }),
  },
  {
    /*
     * De qué programa y curso es la clase. Sin esto el listado eran clases
     * sueltas: "Sesión 1" se repite en cada curso y no había forma de saber a
     * cuál pertenece sin abrir la edición.
     *
     * No es ordenable ni filtrable: los nombres viven en `offers` y `courses`,
     * y el `order` viaja literal a MySQL (fallaría con *Unknown column*).
     */
    field: "offerName",
    header: "Programa",
    showFilterMenu: false,
    type: "custom",
    render: (row: ClassSession) =>
      h(StackedCell, {
        primary: row.courseName ?? "—",
        secondary: row.offerPrefix ?? row.offerName,
        mono: true,
      }),
  },
  {
    field: "sessionDate",
    header: "Fecha",
    sortable: true,
    sortField: "session_date",
    showFilterMenu: false,
    type: "custom",
    render: (row: ClassSession) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.sessionDate,
      ),
  },
  {
    field: "meetLink",
    header: "Enlace",
    showFilterMenu: false,
    type: "custom",
    render: (row: ClassSession) =>
      row.meetLink
        ? h(
            "a",
            {
              href: row.meetLink,
              target: "_blank",
              rel: "noopener noreferrer",
              class: "text-adm-sm text-primary-500 underline",
            },
            "Videollamada",
          )
        : h("span", { class: "text-secondary-400" }, "—"),
  },
];
</script>
<template>
  <!--
    ⚠️ `module` es el PATH real de la ruta, no la carpeta del módulo: el router
    monta este grupo bajo `academic` (ver `modules/enrollments/router/index.ts`),
    así que con "enrollments/..." los botones de crear y editar daban 404.
  -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => classSessionService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        classSessionService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => classSessionService.delete(ids),
    }"
    :show-updated-at="false"
    title="Clases"
    module="academic/class-sessions"
  />
</template>
