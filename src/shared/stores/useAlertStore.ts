import { defineStore } from "pinia";
import { markRaw, ref } from "vue";

import type { ModalAlertProps } from "@/shared/components/type";
import type { Severity } from "@/shared/interface/general";

import SadFace from "@/shared/icons/SadFace.vue";

export const useAlertStore = defineStore("alert-store", () => {
  const showAlertModal = ref(false);

  const config = ref<ModalAlertProps>({
    severity: "danger",
  });

  const showAlert = (
    severity: Severity,
    options: Partial<ModalAlertProps> = {}
  ) => {
    config.value = {
      ...config.value,
      ...options,
      severity,
    };

    showAlertModal.value = true;
  };

  const showError = (options: Partial<ModalAlertProps> = {}) => {
    showAlert("danger", options);
  };

  const showSuccess = (options: Partial<ModalAlertProps> = {}) => {
    showAlert("success", options);
  };

  const showWarning = (options: Partial<ModalAlertProps> = {}) => {
    showAlert("warn", options);
  };

  const showInfo = (options: Partial<ModalAlertProps> = {}) => {
    showAlert("info", options);
  };

  const showGlobalError = (content?: string) => {
    showAlert("info", {
      title: "¡Uy! Algo salió mal",
      content:
        content ?? "Algo salió mal. Vuelve a intentarlo en unos momentos.",
      labelButton: "Entiendo",
      icon: markRaw(SadFace),
    });
  };

  const hideAlert = () => {
    showAlertModal.value = false;
  };

  return {
    showAlertModal,
    config,

    showError,
    showSuccess,
    showWarning,
    showInfo,
    showGlobalError,
    hideAlert,
  };
});
