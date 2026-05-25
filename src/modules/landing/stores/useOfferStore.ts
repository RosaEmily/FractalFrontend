import { defineStore } from "pinia";
import { ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import { offerService } from "../services/offer.service";
import type { OfferList } from "../models/offer.model";

export const useOfferStore = defineStore("landing-offers", () => {
  const data = ref<OfferList | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(params?: Record<string, string>) {
    loading.value = true;
    error.value = null;
    const { data: result, status } = await safeRequest(
      () => offerService.list(params),
      { showAlert: false },
    );
    if (status) data.value = result;
    else error.value = "No se pudo cargar los programas.";
    loading.value = false;
  }

  return { data, loading, error, fetch };
});
