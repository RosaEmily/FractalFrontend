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
import type { Action } from "@/shared/components/ui/grid/column/type";
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
    status?: (ids: (number | string)[], state?: 0 | 1) => Promise<null>;
    delete?: (ids: (number | string)[]) => Promise<null>;
    list: (...args: unknown[]) => Promise<DataPaginationMeta>;
  };
  module: string;
  keys?: {
    identifier?: string;
    status?: string;
  };
  /**
   * Algunos recursos no exponen todas las operaciones (los de landing, por
   * ejemplo, no tienen update-status ni destroy). Estas banderas ocultan la
   * columna y la acción correspondientes en vez de mostrar botones que fallan.
   */
  showStatus?: boolean;
  showDelete?: boolean;
  showUpdatedAt?: boolean;
  /**
   * Algunos listados son de solo lectura (las transacciones las genera la
   * pasarela, no el panel): oculta el botón Crear.
   */
  showCreate?: boolean;
  /**
   * Oculta el lápiz de editar. Los listados de solo lectura (logs, sesiones,
   * transacciones, matrículas) no tienen ruta `edit`: el botón navegaba a una
   * URL inexistente.
   */
  showEdit?: boolean;
  /**
   * Orden inicial del listado, enviado a la API como `order=campo:dir`.
   *
   * Sin esto la API devuelve el orden que salga de la BD — inservible en los
   * listados que se leen por fecha, como la bitácora.
   */
  sortField?: string;
  /** `1` ascendente, `-1` descendente. */
  sortOrder?: 1 | -1;
}

const props = withDefaults(defineProps<SectionList>(), {
  keys: () => ({ identifier: "id", status: "status" }),
  showStatus: true,
  showDelete: true,
  showUpdatedAt: true,
  showCreate: true,
  showEdit: true,
});
const gripUiRefs = useTemplateRef<GridUiTableExpose>("gripUiRefs");

const rowsSelect = computed<T[]>(() => gripUiRefs.value?.rowsSelected ?? []);
const keys = computed(() => {
  return {
    identifier: props.keys?.identifier ?? "id",
    status: props.keys?.status ?? "status",
  };
});

const updatedAtColumn: GridUiColumnProps<T> = {
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
};

const statusColumn: GridUiColumnProps<T> = {
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
};

const rowActions: Action[] = [
  ...(props.showEdit
    ? ([
        {
          type: "edit" as const,
          /*
           * El placeholder lleva la MISMA clave que identifica la fila: con
           * `{id}` fijo, un recurso cuya PK es otra (instructores y estudiantes
           * van por `document_number`) generaba el enlace literal `/edit/{id}`,
           * porque `buildRedirectPath` solo reemplaza el parámetro que recibe.
           */
          redirect: `/admin/${props.module}/edit/{${keys.value.identifier}}`,
          params: keys.value.identifier,
          columnKeyId: keys.value.identifier,
        },
      ] as Action[])
    : []),
  ...(props.showStatus && props.services.status
    ? ([
        {
          type: "state" as const,
          handler: (ids: (number | string)[], state?: 0 | 1) =>
            props.services.status?.(ids, state ?? 1) ?? Promise.resolve(null),
          columnKeyId: keys.value.identifier,
          columnKey: keys.value.status,
        },
      ] as Action[])
    : []),
  ...(props.showDelete && props.services.delete
    ? ([
        {
          type: "delete" as const,
          handler: (ids: (number | string)[]) =>
            props.services.delete?.(ids) ?? Promise.resolve(null),
          columnKeyId: keys.value.identifier,
        },
      ] as Action[])
    : []),
];

/*
 * La página puede traer su propia columna de acciones (Sesiones pinta un botón
 * "Revocar", que la API expone de a una y no encaja en el CRUD genérico). En
 * ese caso NO se agrega la genérica: dos columnas con `field: "actions"` le dan
 * a Vue la misma `key` en el `v-for` del grid, y al recargar el listado
 * reutiliza los nodos mal y las acciones aparecen repetidas en pantalla.
 *
 * Y si no queda ninguna acción que mostrar (un listado de solo lectura), la
 * columna tampoco se agrega: sería una cabecera "Acciones" siempre vacía.
 */
const hasOwnActionsColumn = props.columns.some((col) => col.field === "actions");

const newColumns: GridUiColumnProps<T>[] = [
  ...props.columns,
  ...(props.showUpdatedAt ? [updatedAtColumn] : []),
  ...(props.showStatus ? [statusColumn] : []),
  ...(!hasOwnActionsColumn && rowActions.length
    ? [
        {
          field: "actions",
          header: "Acciones",
          actions: rowActions,
        } as GridUiColumnProps<T>,
      ]
    : []),
];

/**
 * Permite a la página recargar el listado tras una acción propia (por
 * ejemplo revocar una sesión, que no pasa por los servicios del CRUD).
 */
defineExpose({
  refresh: () => gripUiRefs.value?.refreshData(),
});

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
        action: (ids: (number | string)[]) =>
          props.services.status?.(ids) ?? Promise.resolve(null),
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
        action: (ids: (number | string)[]) =>
          props.services.status?.(ids, 0) ?? Promise.resolve(null),
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
            action: (ids: (number | string)[]) =>
              props.services.delete?.(ids) ?? Promise.resolve(null),
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
      :sort-field="sortField"
      :sort-order="sortOrder"
      selection-mode="multiple"
      lazy
    >
      <template #header>
        <ToolbarCore class="!p-0 !border-0">
          <template #start>
            <div class="flex flex-wrap items-baseline gap-3">
              <span
                class="font-display text-lg font-bold uppercase tracking-tight text-secondary-900"
                >{{ title }}</span
              >
            </div>
          </template>
          <template #end>
            <SplitButtonCore
              v-if="showCreate"
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
