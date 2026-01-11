import { defineStore } from "pinia";
import { ref } from "vue";
import type { LoadingDetails } from "@/shared/interface/loading";
export const useLoadingStore = defineStore("loading-store", () => {
  // Estado
  const loading = ref(false);
  const loadingDetails = ref<LoadingDetails>({ type: "spinner" });

  // Acciones
  function setLoading(value: boolean) {
    loading.value = value;
  }

  function start(detail: LoadingDetails = { type: "spinner" }) {
    loadingDetails.value = detail;
    setLoading(true);
    document.body.style.overflow = "hidden";
  }

  function finish() {
    setLoading(false);
    document.body.style.overflow = "";
    loadingDetails.value = { type: "spinner" };
  }

  return {
    loading,
    loadingDetails,
    setLoading,
    start,
    finish,
  };
});
