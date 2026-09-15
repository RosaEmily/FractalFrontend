import { onMounted, ref } from "vue";
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

  return { data, loading, filters, load, apply };
};
