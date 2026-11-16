import { defineStore } from "pinia";
import { ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import { generalService } from "../services/general.service";
import type { General } from "../models/general.model";

export const useGeneralStore = defineStore("landing-general", () => {
  const data = ref<General | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    const { data: result, status } = await safeRequest(
      () => generalService.get(),
      { showAlert: false },
    );
    if (status) data.value = result;
    else error.value = "No se pudo cargar la información general.";
    loading.value = false;
  }

  /*
   * Carga UNA vez por página: el footer, el navbar y la home leen del mismo
   * store al montarse a la vez, y sin esto cada uno dispararía su propio GET.
   */
  let pending: Promise<void> | null = null;
  function ensure(): Promise<void> {
    if (data.value) return Promise.resolve();
    pending ??= fetch().finally(() => {
      pending = null;
    });
    return pending;
  }

  return { data, loading, error, fetch, ensure };
});
