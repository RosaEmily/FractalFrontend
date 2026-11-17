<script setup lang="ts">
import { h, ref } from "vue";
import { mdiEyeOutline } from "@mdi/js";
import { FilterMatchMode } from "@primevue/core";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import ComplaintDetailDialog from "../components/complaint-detail-dialog.vue";
import complaintService from "../services/complaint.service";
import { safeRequest } from "@/shared/utils/request";
import {
  COMPLAINT_STATE_LABEL,
  COMPLAINT_STATE_OPTIONS,
  COMPLAINT_STATE_TONE,
  COMPLAINT_TYPE_OPTIONS,
} from "../constants/complaint.constant";
import type { Complaint } from "../models/complaint.model";
import type { GridUiColumnProps } from "@/shared/components/type";

const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref<Complaint | null>(null);
const list = ref<{ refresh: () => void } | null>(null);

/** El diálogo se abre de inmediato, con su estado de carga, para que el clic tenga efecto. */
const openDetail = async (ids: (number | string)[]) => {
  const [id] = ids;
  if (id === undefined) return;

  detail.value = null;
  detailLoading.value = true;
  detailVisible.value = true;

  const { data } = await safeRequest(() => complaintService.edit(id), { showAlert: false });
  detail.value = data ?? null;
  detailLoading.value = false;
};

const columns: GridUiColumnProps<Complaint>[] = [
  {
    field: "code",
    header: "Código",
    showFilterMenu: false,
    style: "width: 150px",
    type: "custom",
    render: (row: Complaint) =>
      h("span", { class: "font-mono text-adm-sm font-semibold text-secondary-900" }, row.code),
  },
  {
    field: "fullName",
    header: "Consumidor",
    showFilterMenu: false,
    type: "custom",
    render: (row: Complaint) =>
      h("div", { class: "min-w-48" }, [
        h("p", { class: "text-adm-base font-semibold text-secondary-900" }, row.fullName),
        h("p", { class: "text-adm-sm text-secondary-500" }, `${row.documentType} ${row.documentNumber}`),
        h("p", { class: "text-adm-sm text-secondary-500 break-all" }, row.email),
      ]),
  },
  {
    field: "type",
    header: "Tipo",
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "value",
        placeholder: "Selecciona un tipo",
        options: COMPLAINT_TYPE_OPTIONS,
      },
    },
    style: "width: 120px",
    type: "custom",
    render: (row: Complaint) => h(StatusPill, { label: row.typeLabel, tone: "accent" }),
  },
  {
    field: "goodDescription",
    header: "Bien contratado",
    showFilterMenu: false,
    type: "custom",
    render: (row: Complaint) =>
      h("p", { class: "min-w-48 line-clamp-2 text-adm-base text-secondary-500", title: row.detail }, [
        row.contractedLabel,
        " · ",
        row.goodDescription,
      ]),
  },
  {
    field: "dueAt",
    header: "Responder antes del",
    sortField: "due_at",
    sortable: true,
    showFilterMenu: false,
    style: "width: 170px",
    type: "custom",
    render: (row: Complaint) =>
      h(
        "span",
        {
          class: [
            "font-mono text-adm-sm",
            row.isOverdue ? "text-danger-DEFAULT font-semibold" : "text-secondary-500",
          ],
        },
        row.dueAtLabel ?? "—",
      ),
  },
  {
    field: "state",
    header: "Estado",
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "value",
        placeholder: "Selecciona un estado",
        options: COMPLAINT_STATE_OPTIONS,
      },
    },
    style: "width: 140px",
    type: "custom",
    render: (row: Complaint) =>
      h(StatusPill, { label: COMPLAINT_STATE_LABEL[row.state], tone: COMPLAINT_STATE_TONE[row.state] }),
  },
  {
    field: "actions",
    header: "Acciones",
    actions: [
      {
        type: "button",
        icon: mdiEyeOutline,
        handler: openDetail,
        buttonProps: { severity: "secondary", text: true },
      },
    ],
  },
];
</script>

<template>
  <!-- Registro legal: se abre y se responde, no se crea, edita ni elimina desde el panel. -->
  <SectionList
    ref="list"
    :columns="columns"
    :services="{ list: (params: unknown) => complaintService.list(params) }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    :show-edit="false"
    :show-updated-at="false"
    sort-field="created_at"
    :sort-order="-1"
    title="Libro de reclamaciones"
    module="content/complaints"
  />

  <ComplaintDetailDialog
    v-model="detailVisible"
    :complaint="detail"
    :loading="detailLoading"
    @saved="list?.refresh()"
  />
</template>
