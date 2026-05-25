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

  return { data, loading, error, fetch };
});
