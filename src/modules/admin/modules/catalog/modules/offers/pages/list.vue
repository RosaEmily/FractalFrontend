<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import offerService from "../services/offer.service";
import type { Offer } from "../models/offer.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";
import { mdiCalendarClockOutline, mdiCalendarEditOutline } from "@mdi/js";
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
        // `soft` / `paper` del diseño: acento para Línea, neutro para Curso.
        tone: row.type === "learning_path" ? "accent" : "neutral",
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
  /*
   * Columna de acciones PROPIA para sumar las dos de sesiones a las genéricas.
   * `SectionList` detecta que la página ya trae `field: "actions"` y no agrega
   * la suya: dos columnas con el mismo `field` repiten los botones al recargar.
   *
   * Son DOS acciones distintas y no una: el calendario responde "¿qué tiene
   * este programa?" y la gestión "¿qué le falta?". Mezclarlas obligaría a
   * entrar a un formulario para consultar.
   */
  {
    style: "width: 190px",
    field: "actions",
    header: "Acciones",
    actions: [
      {
        type: "redirect",
        // Calendario con reloj: sesiones programadas con fecha y hora, que es
        // justo lo que muestra la pantalla destino. El ojo genérico no decía
        // de qué se veía el detalle.
        icon: mdiCalendarClockOutline,
        redirect: "/admin/catalog/offers/{id}/sessions",
        params: "id",
        columnKeyId: "id",
        /*
         * Sin `buttonProps`: hereda el botón circular del sistema, igual que
         * editar y eliminar. Con `text`/`secondary` salía plano y gris,
         * desalineado del resto de la columna.
         */
      },
      {
        type: "redirect",
        // Calendario con lápiz: crear y actualizar las sesiones del programa.
        icon: mdiCalendarEditOutline,
        redirect: "/admin/catalog/offers/{id}/sessions/manage",
        params: "id",
        columnKeyId: "id",
      },
      {
        type: "edit",
        redirect: "/admin/catalog/offers/edit/{id}",
        params: "id",
        columnKeyId: "id",
      },
      {
        type: "state",
        handler: (ids: (number | string)[], state?: 0 | 1) =>
          offerService.status(ids, state ?? 1),
        columnKeyId: "id",
        columnKey: "status",
      },
      {
        type: "delete",
        handler: (ids: (number | string)[]) => offerService.delete(ids),
        columnKeyId: "id",
      },
    ],
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
