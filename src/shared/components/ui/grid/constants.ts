import type { TagCoreProps } from "@/shared/components/core/tag/type.ts";

export const STATUS: Record<number, TagCoreProps> = {
  0: {
    severity: "danger",
    value: "Deshabilitado",
    rounded: true,
  },
  1: {
    severity: "success",
    value: "Habilitado",
    rounded: true,
  },
};
