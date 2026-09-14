<script setup lang="ts">
import { h, ref } from "vue";
import { mdiEyeOutline } from "@mdi/js";
import SectionList from "@/modules/admin/components/Section/list.vue";
import LevelCell from "../components/level-cell.vue";
import LogDetailDialog from "../components/log-detail-dialog.vue";
import StackedCell from "@/modules/admin/components/ui/stacked-cell.vue";
import logService from "../services/log.service";
import { safeRequest } from "@/shared/utils/request";
import type { Log, LogDetail } from "../models/log.model";
import type { GridUiColumnProps } from "@/shared/components/type";
import { FilterMatchMode } from "@primevue/core";
import { LOG_ENTITY_OPTIONS, LOG_ENTITY_NONE } from "../constants/log.constant";

const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref<LogDetail | null>(null);

/**
 * Abre el detalle del log.
 *
 * El diálogo se muestra antes de que llegue la respuesta —con su estado de
 * carga— para que el clic tenga efecto inmediato: `show` trae el stack completo
 * y en este entorno cada petición tarda unos segundos.
 */
const openDetail = async (ids: (number | string)[]) => {
  const [id] = ids;
  if (id === undefined) return;

  detail.value = null;
  detailLoading.value = true;
  detailVisible.value = true;

  const { data } = await safeRequest(() => logService.edit(id), {
    showAlert: false,
  });

  detail.value = data ?? null;
  detailLoading.value = false;
};

/**
 * Traduce el centinela "Sin entidad" a `entity_type = null`, que es lo que la
 * API entiende.
 *
 * ⚠️ No se puede poner `value: null` directo en el filtro: `primeToApiFilters`
 * descarta los filtros con valor null o vacío (es lo que distingue "sin filtro"
 * de "filtrado"), así que el filtro nunca llegaría. De ahí el centinela.
 *
 * Se traduce acá y no en `primeToApiFilters` porque ese helper es el contrato
 * de los 31 listados.
 */
const listWithEntityFilter = (params: unknown) => {
  const p = params as { filters?: Record<string, { value: unknown }> };
  const entity = p?.filters?.entityType;

  if (entity && entity.value === LOG_ENTITY_NONE) {
    return logService.list({
      ...p,
      filters: { ...p.filters, entityType: { ...entity, value: null } },
    });
  }

  return logService.list(params);
};

const ENTITY_OPTIONS = [
  { label: "Sin entidad", value: LOG_ENTITY_NONE },
  ...LOG_ENTITY_OPTIONS,
];

const LEVEL_OPTIONS = [
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "error" },
  { label: "Debug", value: "debug" },
];

const columns: GridUiColumnProps<Log>[] = [
  {
    field: "level",
    header: "Nivel",
    sortable: true,
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "value",
        placeholder: "Selecciona un nivel",
        options: LEVEL_OPTIONS,
      },
    },
    type: "custom",
    render: (row: Log) => h(LevelCell, { row }),
  },
  {
    field: "message",
    header: "Mensaje",
    showFilterMenu: false,
    type: "custom",
    /*
     * Segunda línea: `details` como pide el diseño, con `userName` de respaldo.
     *
     * ⚠️ Hoy NINGÚN log escribe `details` (la columna existe y está vacía en
     * los 28 registros), así que en la práctica se ve el usuario. El fallback
     * evita una segunda línea en blanco en el 100% de las filas.
     */
    render: (row: Log) =>
      h(StackedCell, {
        primary: row.message,
        secondary: row.details ?? row.userName,
        mono: false,
        plain: true,
      }),
  },
  {
    /*
     * El filtro va sobre `entity_type` (la columna real), no sobre `entity`,
     * que es el compuesto "Tag #6" que arma el adapter para mostrar.
     */
    field: "entityType",
    header: "Entidad",
    sortField: "entity_type",
    showFilterMenu: true,
    showFilterMatchModes: false,
    filter: { value: null, matchMode: FilterMatchMode.EQUALS },
    filterConfig: {
      component: "select",
      selectProps: {
        optionLabel: "label",
        optionValue: "value",
        placeholder: "Selecciona una entidad",
        options: ENTITY_OPTIONS,
        filter: true,
      },
    },
    type: "custom",
    render: (row: Log) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.entity ?? "—",
      ),
  },
  {
    field: "endpoint",
    header: "Endpoint",
    showFilterMenu: false,
    type: "custom",
    render: (row: Log) =>
      h(
        "span",
        { class: "font-mono text-adm-xs text-secondary-400 truncate" },
        row.httpMethod
          ? `${row.httpMethod} ${row.endpoint ?? ""}`
          : (row.endpoint ?? "—"),
      ),
  },
  {
    field: "createdAt",
    header: "Fecha",
    sortable: true,
    // El modelo usa camelCase, pero el `order` viaja literal a la API, que
    // ordena por columna real: sin esto pediría `order=createdAt:desc` y MySQL
    // no conoce esa columna.
    sortField: "created_at",
    showFilterMenu: false,
    type: "custom",
    render: (row: Log) =>
      h(
        "span",
        { class: "font-mono text-adm-sm text-secondary-500" },
        row.createdAt,
      ),
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
  <!-- Solo lectura: los escriben el middleware y el handler de excepciones. -->
  <SectionList
    :columns="columns"
    :services="{ list: listWithEntityFilter }"
    :show-status="false"
    :show-delete="false"
    :show-create="false"
    :show-edit="false"
    :show-updated-at="false"
    title="Bitácora del sistema"
    module="system/logs"
    sort-field="created_at"
    :sort-order="-1"
  />

  <LogDetailDialog
    v-model="detailVisible"
    :log="detail"
    :loading="detailLoading"
  />
</template>
