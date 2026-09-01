<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import paymentMethodService from "../services/payment-method.service";
import type { PaymentMethod } from "../models/payment-method.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const columns: GridUiColumnProps<PaymentMethod>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: PaymentMethod) =>
      h(
        "span",
        { class: "text-adm-base font-bold text-secondary-900" },
        row.name,
      ),
  },
  {
    field: "description",
    header: "Descripción",
    showFilterMenu: false,
  },
];
</script>
<template>
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => paymentMethodService.list(params),
      status: (ids: (number | string)[], state?: 0 | 1) =>
        paymentMethodService.status(ids, state ?? 1),
      delete: (ids: (number | string)[]) => paymentMethodService.delete(ids),
    }"
    title="Métodos de pago"
    module="payments/payment-methods"
  />
</template>
