<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import { HeroCore } from "@/shared/components";
import { mdiStar, mdiStarOutline } from "@mdi/js";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import testimonialService from "../services/testimonial.service";
import type { Testimonial } from "../models/testimonial.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const toastStore = useToastStore();

/**
 * Curación editorial inline: clic en la estrella alterna `is_featured` sin
 * abrir el formulario. `SectionList` no expone un callback de refresco al
 * `render` de una columna custom (`render?: (row: T) => Component`, sin
 * segundo parámetro), así que en vez de recargar el grid se muta la fila
 * misma: es el objeto reactivo que ya pinta la tabla, y el toggle visual
 * (relleno/contorno) se resuelve solo con ese cambio.
 */
async function toggleFeatured(row: Testimonial) {
  const nextValue = !row.isFeatured;
  const { status } = await safeRequest(
    () => testimonialService.featured([row.id], nextValue),
    { showAlert: false },
  );

  if (status) {
    row.isFeatured = nextValue;
    toastStore.showToastSuccess({
      summary: "Curación editorial",
      detail: nextValue
        ? "Testimonio destacado en la landing."
        : "Testimonio quitado de la landing.",
    });
  } else {
    toastStore.showToastError({ detail: "No se pudo actualizar el destacado." });
  }
}

/*
 * El listado necesita decir de quién y de qué es cada testimonio para poder
 * curarlo, igual que Certificados.
 */
const columns: GridUiColumnProps<Testimonial>[] = [
  {
    field: "studentName",
    header: "Alumno",
    showFilterMenu: false,
    type: "custom",
    render: (row: Testimonial) =>
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
    render: (row: Testimonial) =>
      h(StackedCell, {
        primary: row.subjectName ?? "—",
        secondary: row.subjectTypeLabel,
        mono: false,
        plain: true,
      }),
  },
  {
    field: "subjectTypeLabel",
    header: "Tipo",
    showFilterMenu: false,
    type: "custom",
    render: (row: Testimonial) =>
      h(StatusPill, {
        label: row.subjectTypeLabel,
        tone: row.subjectType === "learning_path" ? "accent" : "neutral",
        dot: false,
      }),
  },
  {
    field: "rating",
    header: "Calificación",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Testimonial) =>
      h(
        "span",
        { class: "font-mono text-adm-sm font-bold text-secondary-900" },
        `${row.rating.toFixed(1)} ★`,
      ),
  },
  {
    field: "body",
    header: "Testimonio",
    showFilterMenu: false,
    type: "custom",
    render: (row: Testimonial) =>
      h(
        "span",
        { class: "line-clamp-2 text-adm-sm text-secondary-500" },
        row.body,
      ),
  },
  {
    field: "isFeatured",
    header: "Destacado",
    style: "width: 110px",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        options: [
          { value: 1, name: "Destacado" },
          { value: 0, name: "No destacado" },
        ],
        optionLabel: "name",
        optionValue: "value",
        placeholder: "Ingrese destacado",
      },
    },
    type: "custom",
    render: (row: Testimonial) =>
      h(
        "button",
        {
          type: "button",
          class: [
            "inline-flex size-8 items-center justify-center rounded-adm-sm transition-colors",
            row.isFeatured
              ? "text-primary-500 hover:bg-primary-50"
              : "text-secondary-300 hover:bg-surface-page",
          ],
          title: row.isFeatured
            ? "Quitar de la landing"
            : "Destacar en la landing",
          onClick: () => toggleFeatured(row),
        },
        [h(HeroCore, { path: row.isFeatured ? mdiStar : mdiStarOutline, class: "size-4" })],
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => testimonialService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        testimonialService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => testimonialService.delete(ids),
    }"
    :show-updated-at="false"
    title="Testimonios"
    module="certification/testimonials"
    sort-field="updated_at"
    :sort-order="-1"
  />
</template>
