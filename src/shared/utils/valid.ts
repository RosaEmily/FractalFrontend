import type { ComplexValue } from "@/shared/interface/primitive";

// STRING → no vacío
export const isValidString = (value: string): boolean =>
  value.trim().length > 0;

// NUMBER → válido si es finito
export const isValidNumber = (value: number): boolean => Number.isFinite(value);

// FILE → size > 0
export const isValidFile = (value: File): boolean => value.size > 0;

// ARRAY → no vacío + todos los items válidos
export const isValidArray = (value: Array<ComplexValue>): boolean =>
  value.length > 0 && value.every((item) => isValidSingleValue(item));

// OBJECT → al menos una propiedad válida
export const isValidObject = (value: object): boolean => {
  const keys = Object.keys(value);

  if (keys.length === 0) return false;

  return keys.every((key) => {
    const field = (value as Record<string, ComplexValue>)[key];
    return isValidSingleValue(field);
  });
};

export const isValidSingleValue = (value: ComplexValue): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") return isValidString(value);
  if (typeof value === "number") return isValidNumber(value);
  if (value instanceof File) return isValidFile(value);
  if (Array.isArray(value)) return isValidArray(value);
  if (typeof value === "object") return isValidObject(value);
  if (typeof value === "boolean") return true;

  return false;
};

export function parseValidUrl(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
