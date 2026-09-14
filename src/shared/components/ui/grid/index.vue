<script setup lang="ts">
import { ref, reactive, computed, onMounted, provide } from "vue";
import DataTable, { type DataTableFilterMeta } from "primevue/datatable";
import Column from "primevue/column";
import GridUiColumn from "./column/index.vue";
import TableSkeleton from "@/modules/admin/components/ui/table-skeleton.vue";
import AdmPagination from "@/modules/admin/components/ui/adm-pagination.vue";

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
/*
 * El orden arranca con lo que declare el listado (`sortField`/`sortOrder`), no
 * en `undefined`: estos props existían en el tipo pero se ignoraban, así que
 * ninguna pantalla podía fijar su orden inicial y la API devolvía el que saliera
 * de la BD. Es lo que hacía ilegible la bitácora.
 */
const order = ref<{
  sortField: string | undefined;
  sortOrder: number;
}>({
  sortField: (props.sortField as string | undefined) ?? undefined,
  sortOrder: props.sortOrder ?? 1,
});

/*
 * `page` es BASE 1, que es lo que lee la API (`Shared/Helpers/Pagination.php`:
 * `skip(($page - 1) * $limit)`). Antes se mandaba `offset`, un parámetro que la
 * API **ignora**: cambiar de página no cambiaba los datos.
 *
 */
const pagination = reactive({
  limit: props.rows,
  page: 1,
  total: props.totalRecords,
});

const filters = ref<DataTableFilterMeta | undefined>(
  buildFiltersFromColumns(props.columns),
);

/*
 * Anchos para el esqueleto: se derivan de las columnas reales para que las
 * barras caigan bajo su columna. La de selección va fija porque la dibuja el
 * propio DataTable y no está en `columns`.
 */
const skeletonColumns = computed<string[]>(() => [
  ...(props.selectionMode ? ["36px"] : []),
  ...props.columns.map((column) =>
    column.field === "actions" ? "150px" : "1fr",
  ),
]);

const prevState = ref({
  order: { ...order.value },
  filters: safeJsonStringify(filters.value),
});

// -------------------- FETCH --------------------
/*
 * `force` salta el guard de `shouldRefresh()`.
 *
 * Ese guard compara orden y filtros para evitar refetches duplicados de
 * PrimeVue, pero NO mira la paginación: al cambiar de página nada cambiaba
 * para él, devolvía `false` y la petición no salía nunca. Paginar es siempre
 * un cambio real, así que pide los datos sin preguntar.
 */
const refreshData = async (init: boolean = false, force: boolean = false) => {
  if (!props.reload || (!init && !force && !shouldRefresh())) return;
  isLoading.value = true;
  try {
    const params: unknown[] = [
      { limit: pagination.limit, page: pagination.page },
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

    /*
     * Si la página pedida quedó fuera de rango —borrar los últimos registros
     * de la última página, o filtrar hasta reducir el total— la API devuelve
     * una lista vacía con `total > 0`: tabla en blanco y paginador diciendo
     * que hay registros. Se retrocede a la última página real y se repite.
     */
    const lastPage = Math.max(1, Math.ceil(pagination.total / pagination.limit));
    if (pagination.page > lastPage) {
      pagination.page = lastPage;
      // El `finally` de esta llamada apaga el loading; la recursiva lo vuelve
      // a encender de inmediato, así que no hay parpadeo.
      await refreshData(false, true);
    }
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
/** Cambio de página: `AdmPagination` ya emite la página en base 1. */
const goToPage = async (page: number) => {
  pagination.page = page;
  await refreshData(false, true);
};

/**
 * Cambio de tamaño de página: vuelve a la página 1.
 *
 * La página 3 de 10 en 10 no tiene equivalente al pasar a 50 en 50, y
 * quedarse ahí puede caer fuera del total y devolver una tabla vacía.
 */
const changeRows = async (rows: number) => {
  pagination.limit = rows;
  pagination.page = 1;
  await refreshData(false, true);
};

/**
 * Ordenar o filtrar vuelve a la página 1.
 *
 * Quedarse en la página 5 tras filtrar puede caer fuera del nuevo total y
 * mostrar una tabla vacía con el paginador diciendo que hay registros. El
 * guard de `shouldRefresh()` sigue mandando aquí: si PrimeVue emite el evento
 * sin que orden ni filtros cambiaran, no se pide nada.
 */
const resetPageAndRefresh = async () => {
  pagination.page = 1;
  await refreshData(false);
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
/** Limpia la selección sin recargar (la X de la barra de acciones masivas). */
const clearSelection = () => {
  rowsSelected.value = [];
};

defineExpose<GridUiTableExpose>({
  refreshData,
  rowsSelected,
  clearSelection,
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
    @sort="resetPageAndRefresh"
    @filter="resetPageAndRefresh"
    class="fractal-basic-table"
  >
    <template #header v-if="$slots['header']">
      <slot name="header" />
    </template>

    <!-- COLUMNAS -->
    <!-- 36px como en el diseño: es un checkbox, no una columna de datos. -->
    <Column
      v-if="selectionMode"
      :selectionMode="selectionMode"
      :exportable="false"
      style="width: 36px"
    />
    <!--
      La `key` incluye el índice: `field` no es único por sí solo (dos columnas
      de acciones lo comparten) y una key repetida hace que Vue reutilice los
      nodos equivocados al recargar, duplicando columnas en pantalla.
    -->
    <GridUiColumn
      v-for="(col, index) in columns"
      :col="col"
      :key="`${String(col.field)}-${index}`"
    />

    <!--
      EMPTY STATE

      PrimeVue usa este slot también MIENTRAS carga, así que sin distinguir los
      dos casos la tabla decía "No se encontraron registros" antes de que la
      respuesta llegara — afirmando que no hay datos sin saberlo todavía.

      Durante la carga se muestra el esqueleto: la forma de lo que va a llegar,
      para que el ojo sepa dónde mirar y la tabla no salte de alto al llenarse.
    -->
    <template #empty>
      <TableSkeleton v-if="isLoading" :columns="skeletonColumns" />
      <div v-else class="flex items-center justify-center">
        No se encontraron registros.
      </div>
    </template>
  </DataTable>

  <!--
    Paginación propia (`AdmPagination` del diseño): el `Paginator` de PrimeVue
    no arma los números de página con elipsis ni el contador `1–10 de 47`.
  -->
  <AdmPagination
    v-if="!paginator && !!reload"
    :total="pagination.total"
    :page="pagination.page"
    :rows="pagination.limit"
    :rows-per-page-options="rowsPerPageOptions"
    @update:page="goToPage"
    @update:rows="changeRows"
  />
</template>

<style lang="css">
.fractal-basic-table {
  /*
   * Las cabeceras van a la IZQUIERDA (`AdmTable`), salvo Acciones, que se
   * centra sobre sus botones (pedido de Sandro, sep 2026 — el diseño la
   * alineaba a la derecha).
   *
   * ⚠️ Antes había un `justify-content: center` para TODAS las cabeceras, que
   * pisaba la alineación de Acciones: el título no coincidía con los botones.
   * La cabecera y la celda se alinean IGUAL o vuelven a descuadrarse.
   */
  .p-datatable-column-header-content {
    justify-content: flex-start;
  }

  th.\!text-center .p-datatable-column-header-content {
    justify-content: center;
  }

  /* Cabecera en mono/uppercase — ver AdmTable en admin/components.jsx */
  .p-datatable-column-title {
    font-family: var(--font-mono);
    font-size: var(--text-adm-label);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .p-datatable-tbody > tr {
    transition: background 0.15s;
  }

  .p-datatable-tbody > tr:hover {
    background: var(--color-admin-row-hover);
  }
}
</style>
