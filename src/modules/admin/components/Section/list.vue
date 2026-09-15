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
import BulkBar from "@/modules/admin/components/ui/bulk-bar.vue";
import { HeroCore } from "@/shared/components";
import { mdiCheck, mdiClose, mdiTrashCanOutline } from "@mdi/js";

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
    style: "width: 190px",
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
    // Ancho fijo como en el diseño (130px): sin él las columnas se reparten el
    // sobrante y una píldora de estado acaba ocupando un tercio de la tabla.
    style: "width: 130px",
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
          // 150px fijos, como en el diseño: es la columna más a la derecha y
          // sin ancho se quedaba con todo el espacio sobrante.
          style: "width: 150px",
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
  // `force`: recargar tras una acción es siempre un cambio real, y el guard
  // interno del grid solo mira orden y filtros — sin esto no se pedía nada.
  refresh: () => gripUiRefs.value?.refreshData(false, true),
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
    // Idem: los datos cambiaron en el servidor aunque orden y filtros sigan
    // iguales, así que el refetch va forzado.
    await gripUiRefs.value?.refreshData(false, true);
  }
};

/*
 * Las tres acciones viven en funciones porque el diseño las ofrece en DOS
 * sitios a la vez: el menú del botón "Crear" (`AdmCreateDropdown`) y la barra
 * flotante (`AdmBulkBar`). Duplicar la lógica en ambos era la vía rápida a que
 * se desincronizaran.
 */
const enableSelected = () =>
  executeAction({
    action: (ids: (number | string)[]) =>
      props.services.status?.(ids) ?? Promise.resolve(null),
    successToast: () =>
      toastStore.showToastSuccess({
        summary: "Actualización de estado",
        detail: "Los registros seleccionados se habilitaron correctamente.",
      }),
  });

const disableSelected = () =>
  executeAction({
    action: (ids: (number | string)[]) =>
      props.services.status?.(ids, 0) ?? Promise.resolve(null),
    successToast: () =>
      toastStore.showToastError({
        summary: "Actualización de estado",
        detail: "Los registros seleccionados se deshabilitaron correctamente.",
      }),
  });

const deleteSelected = () => {
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
            detail: "Los registros seleccionados se eliminaron correctamente.",
          }),
      }),
  });
};

/** Cuántas filas hay marcadas: lo leen la barra y la cabecera del dropdown. */
const selectedCount = computed<number>(() => rowsSelect.value.length);

/*
 * El diseño deshabilita los ítems del menú cuando no hay selección y muestra
 * una cabecera "N SELECCIONADOS" encima. Antes estaban siempre activos y al
 * pulsarlos solo salía un toast de advertencia.
 */
const actionsMassive = computed(() => {
  const noSelection = selectedCount.value === 0;
  const items: Record<string, unknown>[] = [];

  /*
   * Cabecera "N SELECCIONADOS" del diseño. PrimeVue no expone un slot para la
   * cabecera del menú, así que viaja como un ítem más marcado con `header` y
   * el slot `#item` lo pinta distinto. Sin selección no se muestra.
   */
  if (!noSelection) {
    items.push({
      label: `${selectedCount.value} ${
        selectedCount.value === 1 ? "SELECCIONADO" : "SELECCIONADOS"
      }`,
      header: true,
      disabled: true,
    });
  }

  /*
   * El `tone` y el `icon` los pinta el slot `#item`: el diseño da a cada
   * acción un icono en cuadrito de color (verde / ámbar / rojo), no una lista
   * de texto plano.
   */
  if (props.showStatus && props.services.status) {
    items.push(
      {
        label: "Habilitar",
        icon: mdiCheck,
        tone: "ok",
        disabled: noSelection,
        command: enableSelected,
      },
      {
        label: "Deshabilitar",
        icon: mdiClose,
        tone: "warn",
        disabled: noSelection,
        command: disableSelected,
      },
    );
  }

  if (props.showDelete && props.services.delete) {
    if (items.length) items.push({ separator: true });
    items.push({
      label: "Eliminar",
      icon: mdiTrashCanOutline,
      tone: "danger",
      disabled: noSelection,
      command: deleteSelected,
    });
  }

  return items;
});
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
            >
              <!--
                Cada acción con su icono en cuadrito de color, como el
                `AdmMenuItem` del diseño. Deshabilitado = 40% de opacidad.
              -->
              <template #item="{ item }">
                <span v-if="item.header" class="adm-menu-header">
                  {{ item.label }}
                </span>
                <button
                  v-else
                  type="button"
                  class="adm-menu-item"
                  :class="[
                    `adm-menu-item--${item.tone ?? 'default'}`,
                    { 'adm-menu-item--disabled': item.disabled },
                  ]"
                  :disabled="!!item.disabled"
                >
                  <span class="adm-menu-item__icon">
                    <HeroCore v-if="item.icon" :path="item.icon" size="13" />
                  </span>
                  <span>{{ item.label }}</span>
                </button>
              </template>
            </SplitButtonCore>
          </template>
        </ToolbarCore>
      </template>
    </GripUi>
  </CardCore>

  <!--
    Barra flotante del diseño. Va FUERA del CardCore: es `position: fixed`
    sobre el viewport, no parte de la tarjeta del listado.
  -->
  <BulkBar
    :count="selectedCount"
    :show-status="showStatus && !!services.status"
    :show-delete="showDelete && !!services.delete"
    @enable="enableSelected"
    @disable="disableSelected"
    @delete="deleteSelected"
    @clear="gripUiRefs?.clearSelection()"
  />
</template>
