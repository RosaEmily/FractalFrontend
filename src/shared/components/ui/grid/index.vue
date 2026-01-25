<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator, { type PageState } from "primevue/paginator";
import GridUiColumn from "./column/index.vue";

import type { GridUiTableProps } from "./type";
import { ToolbarCore } from "../../core";

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
});

// -------------------- ESTADO --------------------
const rowsSelected = ref<any[]>([]);
const rows = ref(props.data ?? []);
const isLoading = ref(false);

const pagination = reactive({
  limit: props.rows,
  offset: 0,
  total: props.totalRecords,
  first: 0,
});

// -------------------- FETCH --------------------
const refreshData = async () => {
  if (!props.reload) return;
  isLoading.value = true;
  try {
    const params: unknown[] = [
      { limit: pagination.limit, offset: pagination.offset },
    ];
    if (props.argsFunction?.length) params.push(...props.argsFunction);
    const response = await props.reload(...params);
    rows.value = response.items;
    pagination.total = response.meta.total;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
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
  await refreshData();
});

// -------------------- EXPOSE --------------------
defineExpose({
  refreshData,
  rowsSelected,
  rows,
});
</script>

<template>
  <DataTable
    v-model:selection="rowsSelected"
    :value="rows"
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
    class="fractal-basic-table"
  >
    <template #header v-if="title">
      <ToolbarCore class="!p-0 !border-0">
        <template #start>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-lg font-bold uppercase">{{ title }}</span>
          </div>
        </template>
      </ToolbarCore>
    </template>

    <!-- COLUMNAS -->
    <Column
      v-if="selectionMode"
      :selectionMode="selectionMode"
      style="width: 3rem"
      :exportable="false"
    />
    <GridUiColumn v-for="col in columns" :col="col" :key="col.field" />

    <!-- ACCIONES -->
    <!-- <Column
      v-if="actions?.length"
      :exportable="false"
      header="Acciones"
      style="min-width: 12rem"
    >
      <template #body="{ data }">
        <div class="flex gap-2 justify-center">
          <Button
            v-for="action in actions"
            :key="action.label"
            :outlined="true"
            :rounded="true"
            size="small"
            :severity="action.severity"
            :as="action.buttonType === 'link' ? 'a' : 'button'"
            :href="action.href"
            target="_blank"
            @click="() => action.handler?.(data)"
          >
            <IconForm v-if="action.icon" :path="action.icon" size="18" />
            <span v-if="action.label">{{ action.label }}</span>
          </Button>
        </div>
      </template>
    </Column> -->

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
