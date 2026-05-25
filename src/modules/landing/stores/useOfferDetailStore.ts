import { defineStore } from "pinia";
import { ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import { offerService } from "../services/offer.service";
import type { Offer } from "../models/offer.model";

export const useOfferDetailStore = defineStore("landing-offer-detail", () => {
  const data = ref<Offer | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch(id: number) {
    loading.value = true;
    error.value = null;
    const { data: result, status } = await safeRequest(
      () => offerService.get(id),
      { showAlert: false },
    );
    if (status) data.value = result;
    else error.value = "No se pudo cargar el programa.";
    loading.value = false;
  }

  return { data, loading, error, fetch };
});
