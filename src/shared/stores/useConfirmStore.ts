import { defineStore } from "pinia";
import type { ConfirmationOptions } from "primevue/confirmationoptions";
import { useConfirm } from "primevue/useconfirm";
import { ref } from "vue";

export const useConfirmStore = defineStore("confirm-store", () => {
  const confirm = useConfirm();
  const defaultOptions: ConfirmationOptions = {
    message: "message",
    header: "header",
    acceptLabel: "Sí",
    rejectLabel: "No",
  };
  const confirmationOptions = ref<ConfirmationOptions>(defaultOptions);

  const showConfirm = (options: ConfirmationOptions) => {
    confirmationOptions.value = {
      ...defaultOptions,
      ...options,
    };
    confirm.require(confirmationOptions.value);
  };

  const confirmDelete = (onAccept: () => Promise<void> | void) => {
    showConfirm({
      header: "Confirmación",
      message: "¿Seguro que quieres eliminar este registro?",
      accept: onAccept,
      group: "confirmation",
    });
  };

  const confirmAction = (
    message: string,
    onAccept: () => void,
    header = "Confirmación",
  ) => {
    showConfirm({
      header,
      message,
      accept: onAccept,
    });
  };

  return {
    confirmationOptions,

    showConfirm,
    confirmDelete,
    confirmAction,
  };
});
