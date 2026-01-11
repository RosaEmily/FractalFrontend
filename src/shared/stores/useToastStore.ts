import { ref } from "vue";
import { defineStore } from "pinia";
import { useToast } from "primevue/usetoast";
import type {
  ToastOptions,
  ToastStatusMessage,
} from "@/shared/interface/toast";
import { nextTick } from "vue";

export const useToastStore = defineStore("toast-store", () => {
  const toast = useToast();

  const defaultOptions: ToastOptions = {
    severity: "info",
    summary: "Info",
    detail: "Message Content",
    life: 3000,
    group: "notification",
    position: "bottom-right",
    closable: true,
    showIcon: true,
  };
  const toastOptions = ref<ToastOptions>(defaultOptions);

  const showToast = (options: Partial<ToastOptions> = {}): void => {
    toastOptions.value = { ...defaultOptions, ...options };
    nextTick(() => {
      if (toast) {
        toast.add(toastOptions.value);
      }
    });
  };

  const showToastInfo = (options: Partial<ToastOptions> = {}): void => {
    const optionsInfo = Object.fromEntries(
      Object.entries({
        severity: "info",
        summary: options.summary ?? "Información",
        detail: options.detail ?? "Message Info",
        life: options.life,
        group: options.group,
        position: options.position,
        showIcon: options.showIcon,
      }).filter(([, v]) => v != null)
    );
    showToast(optionsInfo);
  };

  const showToastSuccess = (options: Partial<ToastOptions> = {}): void => {
    const optionsSuccess = Object.fromEntries(
      Object.entries({
        severity: "success",
        summary: options.summary ?? "Success",
        detail: options.detail ?? "Message Success",
        life: options.life,
        group: options.group,
        position: options.position,
        showIcon: options.showIcon,
      }).filter(([, v]) => v != null)
    );
    showToast(optionsSuccess);
  };

  const showToastError = (options: Partial<ToastOptions> = {}): void => {
    const optionsError = Object.fromEntries(
      Object.entries({
        severity: "error",
        summary: options.summary ?? "Ups",
        detail: options.detail ?? "Message Error",
        life: options.life,
        group: options.group,
        position: options.position,
        showIcon: options.showIcon,
      }).filter(([, v]) => v != null)
    );
    showToast(optionsError);
  };

  const showToastWarning = (options: Partial<ToastOptions> = {}): void => {
    const optionsWarning = Object.fromEntries(
      Object.entries({
        severity: "warn",
        summary: options.summary ?? "Advertencia",
        detail: options.detail ?? "Message Advertencia",
        life: options.life,
        group: options.group,
        position: options.position,
        showIcon: options.showIcon,
      }).filter(([, v]) => v != null)
    );
    showToast(optionsWarning);
  };

  const clearToast = (): void => {
    if (toast) {
      toast.removeAllGroups();
    }
  };

  const showStatusToast = ({ status, message }: ToastStatusMessage): void => {
    const optionsToast: ToastOptions = {
      detail: message,
    };
    return status
      ? showToastSuccess(optionsToast)
      : showToastError(optionsToast);
  };

  return {
    toastOptions,
    showToast,
    clearToast,
    showToastInfo,
    showToastSuccess,
    showToastError,
    showToastWarning,
    showStatusToast,
  };
});
