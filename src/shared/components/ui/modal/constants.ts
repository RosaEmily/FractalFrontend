// constants.ts
import type { SeverityConfig } from "./type";

import IconCheckCircle from "@/shared/icons/CheckCircle.vue";
import IconAlertTriangle from "@/shared/icons/AlertTriangle.vue";
import IconXCircle from "@/shared/icons/XCircle.vue";
import IconAlertCircle from "@/shared/icons/AlertCircle.vue";

import type { Severity } from "@/shared/interface/general";
import { markRaw, h } from "vue";

export const SEVERITY: Record<Severity, SeverityConfig> = {
  success: { icon: markRaw(IconCheckCircle), title: "¡Listo!" },
  danger: {
    icon: markRaw(h(IconXCircle, { class: "fill-warning-600" })),
    title: "¡Ups!",
  },
  warn: { icon: markRaw(IconAlertTriangle), title: "¡Advertencia!" },
  info: {
    icon: markRaw(h(IconAlertCircle, { class: "fill-info-600" })),
    title: "¡Información!",
  },
  secondary: { icon: markRaw(IconAlertCircle), title: "Secundario" }, // ejemplo
  help: { icon: markRaw(IconAlertCircle), title: "Ayuda" }, // ejemplo
  contrast: { icon: markRaw(IconAlertCircle), title: "Contraste" }, // ejemplo
};
