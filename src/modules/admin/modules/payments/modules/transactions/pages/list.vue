<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import transactionService from "../services/transaction.service";
import StatusCell from "../components/status-cell.vue";
import type { Transaction } from "../models/transaction.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<Transaction>[] = [
  {
    field: "enrollmentId",
    header: "Matrícula",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: Transaction) =>
      h(
        "span",
        { class: "text-adm-base font-bold text-secondary-900" },
        `#${row.enrollmentId}`,
      ),
  },
  {
    field: "paymentMethodName",
    header: "Método",
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
  {
    field: "amountFormat",
    header: "Monto",
    showFilterMenu: false,
    type: "custom",
    render: (row: Transaction) =>
      h(
        "span",
        { class: "font-mono text-adm-md font-semibold text-secondary-900" },
        row.amountFormat,
      ),
  },
  {
    field: "gatewayId",
    header: "ID pasarela",
    showFilterMenu: false,
    type: "custom",
    render: (row: Transaction) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-400" },
        row.gatewayId ?? "—",
      ),
  },
  {
    field: "status",
    header: "Estado",
    showFilterMenu: false,
    type: "custom",
    render: (row: Transaction) => h(StatusCell, { row }),
  },
];
</script>
<template>
  <!--
    Solo lectura: las transacciones las genera la pasarela de pago, así que
    no hay crear, editar, borrar ni cambio de estado.
  -->
  <SectionList
    :columns="columns"
    :services="{ list: (params: unknown) => transactionService.list(params) }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    title="Transacciones"
    module="payments/transactions"
  />
</template>
