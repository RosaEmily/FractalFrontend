import { defineStore } from "pinia";
import type { ConfirmationOptions } from "primevue/confirmationoptions";
import { useConfirm } from "primevue/useconfirm";
import { ref } from "vue";
import { string } from "zod";

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

  const confirmDelete = (config: {
    message?: string;
    header?: string;
    accept: () => Promise<void> | void;
  }) => {
    const {
      header = "Confirmación",
      message = "¿Seguro que quieres eliminar este registro?",
      accept,
    } = config;
    showConfirm({
      header,
      message,
      accept,
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
