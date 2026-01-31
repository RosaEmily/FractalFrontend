import { toRaw } from "vue";
import { safeJsonStringify, safeJsonParse } from "./safe-json";

export const deepClone = <T>(value: T): T => {
  return safeJsonParse(safeJsonStringify(value)) as T;
};

export const deepCloneV2 = <T>(value: T): T => {
  return structuredClone<T>(toRaw<T>(value));
};

const deepToRaw = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map(deepToRaw) as unknown as T;

  const rawObj = toRaw(obj);

  return Object.fromEntries(
    Object.entries(rawObj).map(([key, value]) => [key, deepToRaw(value)]),
  ) as unknown as T;
};

export const deepCloneV3 = <T>(value: T): T => {
  return structuredClone<T>(deepToRaw<T>(value));
};
