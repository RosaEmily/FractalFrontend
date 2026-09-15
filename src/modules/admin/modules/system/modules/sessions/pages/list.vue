<script setup lang="ts">
import { h, ref } from "vue";
import SectionList from "@/modules/admin/components/Section/list.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import { ButtonCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmStore } from "@/shared/stores/useConfirmStore";
import sessionService from "../services/session.service";
import type { SystemSession } from "../models/session.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";

const listRef = ref<{ refresh?: () => void } | null>(null);
const revoking = ref<number | null>(null);

/**
 * La API revoca de a una sesión (sin bulk-delete), y rechaza cerrar la
 * sesión con la que se está operando.
 */
const onRevoke = (row: SystemSession) => {
  const confirmStore = useConfirmStore();
  confirmStore.confirmDelete({
    header: "Revocar sesión",
    message: `¿Seguro que quieres cerrar la sesión de ${row.userName}?`,
    accept: async () => {
      revoking.value = row.id;
      const toastStore = useToastStore();
      const { status, error } = await safeRequest(
        () => sessionService.revoke(row.id),
        { showAlert: false },
      );
      revoking.value = null;

      if (status && !error) {
        toastStore.showToastSuccess({ detail: "Sesión cerrada correctamente" });
        listRef.value?.refresh?.();
        return;
      }
      toastStore.showToastError({ detail: error?.message });
    },
  });
};

const columns: GridUiColumnProps<SystemSession>[] = [
  {
    field: "userName",
    header: "Usuario",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: "custom",
    render: (row: SystemSession) =>
      h(StackedCell, { primary: row.userName, secondary: row.userEmail }),
  },
  {
    field: "device",
    header: "Dispositivo",
    showFilterMenu: false,
  },
  {
    field: "location",
    header: "Ubicación",
    showFilterMenu: false,
  },
  {
    field: "ipAddress",
    header: "IP",
    showFilterMenu: false,
    type: "custom",
    render: (row: SystemSession) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.ipAddress,
      ),
  },
  {
    field: "expiresAt",
    header: "Expira",
    sortable: true,
    showFilterMenu: false,
    type: "custom",
    render: (row: SystemSession) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.expiresAt,
      ),
  },
  {
    field: "actions",
    header: "Acciones",
    showFilterMenu: false,
    type: "custom",
    render: (row: SystemSession) =>
      h(ButtonCore, {
        class: "!w-auto",
        severity: "danger",
        outlined: true,
        size: "small",
        label: "Revocar",
        loading: revoking.value === row.id,
        onClick: () => onRevoke(row),
      }),
  },
];
</script>
<template>
  <!--
    Sesiones de todos los usuarios. Solo lectura salvo el revocar, que va
    como acción propia porque la API no expone bulk-delete.
  -->
  <SectionList
    ref="listRef"
    :columns="columns"
    :services="{ list: (params: unknown) => sessionService.list(params) }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    :show-updated-at="false"
    title="Sesiones activas"
    module="system/sessions"
  />
</template>
