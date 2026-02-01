<script setup lang="ts">
import { ref, reactive, onMounted, provide } from "vue";
import DataTable, { type DataTableFilterMeta } from "primevue/datatable";
import Column from "primevue/column";
import Paginator, { type PageState } from "primevue/paginator";
import GridUiColumn from "./column/index.vue";

import { type GridUiTableExpose, type GridUiTableProps, GridKey } from "./type";
import { buildFiltersFromColumns, primeToApiFilters } from "./utils/format";
import { hasChanged } from "@/shared/utils/valid";
import { safeJsonStringify } from "@/shared/utils/safe-json";

// -------------------- PROPS --------------------
const props = withDefaults(defineProps<GridUiTableProps<any>>(), {
  data: () => [],
  paginator: false,
  rowsPerPageOptions: () => [5, 10, 20, 50],
  paginatorTemplate:
    "RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink",
  currentPageReportTemplate:
    "Mostrando del {first} al {last} de {totalRecords} registros",
  dataKey: "id",
  totalRecords: 0,
  rows: 10,
  removableSort: true,
  filterDisplay: "menu",
  stateStorage: "session",
  stateKey: "dt-fractal",
});

// -------------------- ESTADO --------------------
const rowsSelected = ref<NoInfer<any>[] | NoInfer<any>>([]);
const data = ref(props.data ?? []);
const isLoading = ref(false);
const order = ref({
  sortField: undefined,
  sortOrder: 1,
});

const pagination = reactive({
  limit: props.rows,
  offset: 0,
  total: props.totalRecords,
  first: 0,
});

const filters = ref<DataTableFilterMeta | undefined>(
  buildFiltersFromColumns(props.columns),
);

const prevState = ref({
  order: { ...order.value },
  filters: safeJsonStringify(filters.value),
});

// -------------------- FETCH --------------------
const refreshData = async (init: boolean = false) => {
  if (!props.reload || (!init && !shouldRefresh())) return;
  isLoading.value = true;
  try {
    const params: unknown[] = [
      { limit: pagination.limit, offset: pagination.offset },
    ];
    if (order.value.sortField) {
      params.push({
        order: `${order.value.sortField}:${order.value.sortOrder == 1 ? "asc" : "desc"}`,
      });
    }
    if (filters.value) {
      params.push({
        filters: primeToApiFilters(filters.value),
      });
    }
    if (props.argsFunction?.length) params.push(...props.argsFunction);
    const response = await props.reload(Object.assign({}, ...params));
    data.value = response.items;
    pagination.total = response.meta.total;
    rowsSelected.value = [];
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const shouldRefresh = (): boolean => {
  const changed = hasChanged(prevState.value, {
    order: order.value,
    filters: safeJsonStringify(filters.value),
  });
  if (changed) {
    prevState.value = {
      order: { ...order.value },
      filters: safeJsonStringify(filters.value),
    };
  }
  return changed;
};

// -------------------- PAGINACIÓN --------------------
const updatePage = async (event: PageState) => {
  const { rows: limit, page } = event;
  pagination.offset = page;
  if (pagination.limit !== limit) pagination.offset = 0;
  pagination.first = pagination.offset * limit;
  pagination.limit = limit;
  await refreshData();
};

onMounted(async () => {
  await refreshData(true);
});

const setLoading = (value: boolean) => {
  isLoading.value = value;
};

// -------------------- PROVIDE --------------------

provide(GridKey, {
  setLoading,
  refreshData,
});

// -------------------- EXPOSE --------------------
defineExpose<GridUiTableExpose>({
  refreshData,
  rowsSelected,
});
</script>

<template>
  <DataTable
    v-model:selection="rowsSelected"
    v-model:sortField="order.sortField"
    v-model:sortOrder="order.sortOrder"
    v-model:filters="filters"
    :value="data"
    :dataKey="dataKey"
    :loading="isLoading"
    :selectionMode="selectionMode"
    showGridlines
    scrollable
    rowHover
    stripedRows
    :paginator="!paginator && !reload"
    :rows="pagination.limit"
    :paginatorTemplate="paginatorTemplate"
    :currentPageReportTemplate="currentPageReportTemplate"
    :rowsPerPageOptions="rowsPerPageOptions"
    :removableSort="removableSort"
    :lazy="lazy"
    :filterDisplay="filterDisplay"
    @sort="refreshData(false)"
    @filter="refreshData(false)"
    class="fractal-basic-table"
  >
    <template #header v-if="$slots['header']">
      <slot name="header" />
    </template>

    <!-- COLUMNAS -->
    <Column
      v-if="selectionMode"
      :selectionMode="selectionMode"
      :exportable="false"
    />
    <GridUiColumn v-for="col in columns" :col="col" :key="col.field" />

    <!-- EMPTY STATE -->
    <template #empty>
      <div class="flex items-center justify-center">
        No se encontraron registros.
      </div>
    </template>
  </DataTable>

  <Paginator
    v-if="!paginator && !!reload"
    :first="pagination.first"
    :rows="pagination.limit"
    :totalRecords="pagination.total"
    :rowsPerPageOptions="rowsPerPageOptions"
    :template="{
      default: paginatorTemplate,
    }"
    :currentPageReportTemplate="currentPageReportTemplate"
    @page="updatePage"
  />
</template>

<style lang="css">
.fractal-basic-table {
  .p-datatable-column-header-content {
    justify-content: center;
  }
}
</style>
