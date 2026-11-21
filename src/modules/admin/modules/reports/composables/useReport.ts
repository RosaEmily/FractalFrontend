import { computed, onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import type { ReportFilters } from "../dto/report.dto";

/**
 * Carga de un reporte con filtros. Las 6 pantallas comparten el mismo ciclo
 * (cargar al montar → aplicar filtros → recargar), así que vive acá.
 */
export const useReport = <T>(
  fetcher: (filters: ReportFilters) => Promise<T | null>,
) => {
  const data = ref<T | null>(null);
  const loading = ref<boolean>(true);
  const filters = ref<ReportFilters>({});

  const load = async () => {
    loading.value = true;
    const { data: resp } = await safeRequest(() => fetcher(filters.value), {
      showAlert: false,
    });
    data.value = resp ?? null;
    loading.value = false;
  };

  /** Reemplaza los filtros y recarga. */
  const apply = async (next: ReportFilters) => {
    filters.value = { ...filters.value, ...next };
    await load();
  };

  onMounted(load);

  /*
   * Esqueleto solo en la primera carga. Al aplicar filtros el reporte anterior
   * se queda en pantalla (atenuado) mientras llega el nuevo: si se reemplazara
   * por el esqueleto, la página se acortaría y el navegador subiría el scroll.
   */
  const initializing = computed(() => loading.value && data.value === null);
  const refreshing = computed(() => loading.value && data.value !== null);

  return { data, loading, initializing, refreshing, filters, load, apply };
};
