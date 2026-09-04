<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import offerService from "../services/offer.service";
import type { Offer } from "../models/offer.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";
import { OFFER_TYPE_OPTIONS } from "../constants/offer.constant";

const columns: GridUiColumnProps<Offer>[] = [
  {
    field: "name",
    header: "Programa",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    // El prefijo va como segunda línea, no como columna propia.
    type: "custom",
    render: (row: Offer) =>
      h(StackedCell, { primary: row.name, secondary: row.prefix }),
  },
  {
    field: "typeLabel",
    header: "Tipo",
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "value",
        placeholder: "Seleccione el tipo",
        options: OFFER_TYPE_OPTIONS,
      },
    },
    type: "custom",
    render: (row: Offer) =>
      h(StatusPill, {
        label: row.typeLabel,
        tone: row.type === "learning_path" ? "info" : "neutral",
        dot: false,
      }),
  },
  {
    field: "enrollmentRange",
    header: "Matrícula",
    showFilterMenu: false,
    type: "custom",
    render: (row: Offer) =>
      h(
        "span",
        { class: "text-adm-sm text-secondary-500" },
        row.enrollmentRange,
      ),
  },
  {
    field: "seats",
    header: "Cupo",
    showFilterMenu: false,
    type: "custom",
    render: (row: Offer) =>
      h("span", { class: "font-mono text-adm-sm text-secondary-900" }, row.seats),
  },
  {
    field: "price",
    header: "Precio",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Offer) =>
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
      list: (params: unknown) => offerService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        offerService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => offerService.delete(ids),
    }"
    :show-updated-at="false"
    title="Lista de programas"
    module="catalog/offers"
  />
</template>
