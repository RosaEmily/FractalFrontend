<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import currencyService from "../services/currency.service";
import CodeCell from "../components/code-cell.vue";
import type { Currency } from "../models/currency.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Currency>[] = [
  {
    field: "code",
    header: "Código",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    type: "custom",
    render: (row: Currency) => h(CodeCell, { row }),
  },
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "symbol",
    header: "Símbolo",
    showFilterMenu: false,
    type: "custom",
    render: (row: Currency) =>
      h("span", { class: "font-mono text-adm-md text-secondary-900" }, row.symbol),
  },
  {
    field: "isoNumber",
    header: "ISO 4217",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Currency) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        String(row.isoNumber ?? "—"),
      ),
  },
  {
    field: "country",
    header: "País",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "decimalPlaces",
    header: "Decimales",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Currency) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        String(row.decimalPlaces),
      ),
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => currencyService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        currencyService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => currencyService.delete(ids),
    }"
    title="Monedas"
    module="catalog/currencies"
  />
</template>
