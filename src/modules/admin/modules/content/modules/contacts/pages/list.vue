<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import FavoriteCell from "@/modules/admin/components/ui/favorite-cell.vue";
import contactService from "../services/contact.service";
import type { Contact } from "../models/contact.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";
import { CONTACT_TYPE_OPTIONS } from "../constants/contact.constant";

const columns: GridUiColumnProps<Contact>[] = [
  {
    field: "description",
    header: "Descripción",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: Contact) =>
      h(
        "span",
        { class: "text-adm-base font-semibold text-secondary-900" },
        row.description,
      ),
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
        optionValue: "label",
        placeholder: "Selecciona un tipo",
        options: CONTACT_TYPE_OPTIONS,
      },
    },
    type: "custom",
    render: (row: Contact) =>
      h(StatusPill, { label: row.typeLabel, tone: "neutral", dot: false }),
  },
  {
    field: "value",
    header: "Valor",
    showFilterMenu: false,
  },
  {
    field: "isFavorite",
    header: "Destacado",
    showFilterMenu: false,
    type: "custom",
    render: (row: Contact) =>
      h(FavoriteCell, { favorite: row.isFavorite ? 1 : 0 }),
  },
];
</script>
<template>
  <!-- Recurso de landing: JSON en S3, sin status ni updated_at. -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => contactService.list(params),
      delete: (ids: (number | string)[]) => contactService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    title="Contactos"
    module="content/contacts"
  />
</template>
