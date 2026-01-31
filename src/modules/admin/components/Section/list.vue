<script setup lang="ts" generic="T">
import {
  CardCore,
  GripUi,
  SplitButtonCore,
  ToolbarCore,
} from "@/shared/components";
import type {
  GridUiColumnProps,
  GridUiTableExpose,
} from "@/shared/components/type";
import type { DataPaginationMeta } from "@/shared/interface/api-response";
import { safeRequest } from "@/shared/utils/request";
import { computed, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmStore } from "@/shared/stores/useConfirmStore";
import { FilterMatchMode } from "@primevue/core";

const router = useRouter();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();

interface SectionList {
  columns: GridUiColumnProps<T>[];
  title: string;
  services: {
    status: (ids: (number | string)[], state?: 0 | 1) => Promise<null>;
    delete: (ids: (number | string)[]) => Promise<null>;
    list: (...args: unknown[]) => Promise<DataPaginationMeta>;
  };
  module: string;
  keys?: {
    identifier?: string;
    status?: string;
  };
}

const props = withDefaults(defineProps<SectionList>(), {
  keys: () => ({ identifier: "id", status: "status" }),
});
const gripUiRefs = useTemplateRef<GridUiTableExpose>("gripUiRefs");

const rowsSelect = computed<T[]>(() => gripUiRefs.value?.rowsSelected ?? []);
const keys = computed(() => {
  return {
    identifier: props.keys?.identifier ?? "id",
    status: props.keys?.status ?? "status",
  };
});

const newColumns: GridUiColumnProps<T>[] = [
  ...props.columns,
  {
    field: "updated_at",
    header: "Fecha de actualización",
    type: "date",
    sortable: true,
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.BETWEEN },
    filterConfig: {
      component: "datepicker",
      datepickerProps: {
        maxDate: new Date(),
        selectionMode: "range",
        dayjsFormatValue: "YYYY-MM-DD HH:mm:ss",
        dateUtc: true,
        hourFormat: "12",
      },
    },
  },
  {
    field: "status",
    header: "Estado",
    type: "state",
    sortable: true,
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        options: [
          { value: 0, name: "Deshabilitado" },
          { value: 1, name: "Habilitado" },
        ],
        optionLabel: "name",
        optionValue: "value",
        placeholder: "Ingrese estado",
      },
    },
  },
  {
    field: "actions",
    header: "Acciones",
    actions: [
      {
        type: "edit",
        redirect: `/admin/${props.module}/edit/{id}`,
        columnKeyId: keys.value.identifier,
      },
      {
        type: "state",
        handler: (ids: (number | string)[], state?: 0 | 1) =>
          props.services.status(ids, state ?? 1),
        columnKeyId: keys.value.identifier,
        columnKey: keys.value.status,
      },
      {
        type: "delete",
        handler: (ids: (number | string)[]) => props.services.delete(ids),
        columnKeyId: keys.value.identifier,
      },
    ],
  },
];

const getSelectedIds = () =>
  rowsSelect.value.map((item) => item[keys.value.identifier]);

const validateSelection = (ids: (number | string)[]) => {
  if (ids.length === 0) {
    toastStore.showToastWarning({
      summary: "Advertencia",
      detail: "Seleccione uno o más registros",
    });
    return false;
  }
  return true;
};

const executeAction = async ({
  action,
  successToast,
}: {
  action:
    | ((ids: (number | string)[]) => Promise<null>)
    | ((ids: (number | string)[], state?: 0 | 1) => Promise<null>);
  successToast: () => void;
}) => {
  const ids = getSelectedIds();
  if (!validateSelection(ids)) return;

  const { status, error } = await safeRequest(() => action(ids));

  if (status && !error) {
    successToast();
    await gripUiRefs.value?.refreshData();
  }
};

const actionsMassive = [
  {
    label: "Habilitar",
    command: () =>
      executeAction({
        action: (ids: (number | string)[]) => props.services.status(ids),
        successToast: () =>
          toastStore.showToastSuccess({
            summary: "Actualización de estado",
            detail: "Los registros seleccionados se habilitaron correctamente.",
          }),
      }),
  },
  {
    label: "Deshabilitar",
    command: () =>
      executeAction({
        action: (ids: (number | string)[]) => props.services.status(ids, 0),
        successToast: () =>
          toastStore.showToastError({
            summary: "Actualización de estado",
            detail:
              "Los registros seleccionados se deshabilitaron correctamente.",
          }),
      }),
  },
  {
    separator: true,
  },
  {
    label: "Eliminar",
    command: async () => {
      const ids = getSelectedIds();
      if (!validateSelection(ids)) return;

      confirmStore.confirmDelete({
        message:
          "¿Estás seguro de que deseas eliminar los registros seleccionados?",
        accept: () =>
          executeAction({
            action: (ids: (number | string)[]) => props.services.delete(ids),
            successToast: () =>
              toastStore.showToastError({
                summary: "Eliminación",
                detail:
                  "Los registros seleccionados se eliminaron correctamente.",
              }),
          }),
      });
    },
  },
];
</script>
<template>
  <CardCore>
    <GripUi
      ref="gripUiRefs"
      :reload="(params: unknown) => services.list(params)"
      :columns="newColumns"
      selection-mode="multiple"
      lazy
    >
      <template #header>
        <ToolbarCore class="!p-0 !border-0">
          <template #start>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-lg font-bold uppercase">{{ title }}</span>
            </div>
          </template>
          <template #end>
            <SplitButtonCore
              label="Crear"
              severity="contrast"
              @click="router.replace(`/admin/${props.module}/create`)"
              :model="actionsMassive"
              auto-z-index
            />
          </template>
        </ToolbarCore>
      </template>
    </GripUi>
  </CardCore>
</template>
