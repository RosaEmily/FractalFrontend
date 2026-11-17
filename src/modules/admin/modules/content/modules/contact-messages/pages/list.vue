<script setup lang="ts">
import { h } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import AttendedCell from "../components/attended-cell.vue";
import contactMessageService from "../services/contact-message.service";
import type { ContactMessage } from "../models/contact-message.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const columns: GridUiColumnProps<ContactMessage>[] = [
  {
    field: "createdAt",
    header: "Recibido",
    type: "date",
    showFilterMenu: false,
    style: "width: 170px",
  },
  {
    field: "fullName",
    header: "Contacto",
    showFilterMenu: false,
    type: "custom",
    render: (row: ContactMessage) =>
      h("div", { class: "min-w-48" }, [
        h("p", { class: "text-adm-base font-semibold text-secondary-900" }, row.fullName),
        h("p", { class: "text-adm-sm text-secondary-500 break-all" }, row.email),
        row.phone ? h("p", { class: "text-adm-sm text-secondary-500" }, row.phone) : null,
      ]),
  },
  {
    field: "program",
    header: "Programa de interés",
    showFilterMenu: false,
    type: "custom",
    render: (row: ContactMessage) =>
      h(
        "p",
        { class: "min-w-40 text-adm-base text-secondary-500" },
        [row.program ?? "—", row.profession ? ` · ${row.profession}` : ""].join(""),
      ),
  },
  {
    field: "message",
    header: "Mensaje",
    showFilterMenu: false,
    type: "custom",
    // Recortado: el texto completo sale al pasar el mouse.
    render: (row: ContactMessage) =>
      h(
        "p",
        {
          class: "min-w-64 line-clamp-3 text-adm-base text-secondary-500",
          title: row.message,
        },
        row.message,
      ),
  },
  {
    field: "isAttended",
    header: "Estado",
    showFilterMenu: false,
    style: "width: 130px",
    type: "custom",
    render: (row: ContactMessage) =>
      h(AttendedCell, { id: row.id, attended: row.isAttended }),
  },
];
</script>
<template>
  <!-- Solo lectura: lo que llega del formulario no se crea ni se edita en el panel. -->
  <SectionList
    :columns="columns"
    :services="{
      list: (params: unknown) => contactMessageService.list(params),
      delete: (ids: (number | string)[]) => contactMessageService.delete(ids),
    }"
    :show-status="false"
    :show-updated-at="false"
    :show-create="false"
    :show-edit="false"
    sort-field="created_at"
    :sort-order="-1"
    title="Mensajes de contacto"
    module="content/contact-messages"
  />
</template>
