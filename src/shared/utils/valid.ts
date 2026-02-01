import type { ComplexValue } from "@/shared/interface/primitive";
import { safeJsonStringify } from "./safe-json";

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

const normalizeForCompare = (
  value: unknown,
  seen = new WeakMap<object, true>(),
): unknown => {
  // Primitive
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Circular reference
  if (seen.has(value)) {
    return "[Circular]";
  }

  // File
  if (value instanceof File) {
    return {
      __type: "File",
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  // Date
  if (value instanceof Date) {
    return {
      __type: "Date",
      value: value.toISOString(),
    };
  }

  seen.set(value, true);

  // Map
  if (value instanceof Map) {
    return {
      __type: "Map",
      value: Array.from(value.entries())
        .map(([k, v]) => [
          normalizeForCompare(k, seen),
          normalizeForCompare(v, seen),
        ])
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    };
  }

  // Set
  if (value instanceof Set) {
    return {
      __type: "Set",
      value: Array.from(value.values())
        .map((v) => normalizeForCompare(v, seen))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    };
  }

  // Array
  if (Array.isArray(value)) {
    return value.map((v) => normalizeForCompare(v, seen));
  }

  // Object
  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = normalizeForCompare(
        (value as Record<string, unknown>)[key],
        seen,
      );
      return acc;
    }, {});
};

export const hasChanged = (initData: unknown, newData: unknown): boolean => {
  const a = normalizeForCompare(initData);
  const b = normalizeForCompare(newData);
  return safeJsonStringify(a) !== safeJsonStringify(b);
};

export function validateUrl(value?: string | null): boolean {
  if (!value) return false; // vacío no permitido

  try {
    const url = new URL(value);

    // Protocolo debe ser https:
    if (url.protocol !== "https:") return false;

    // Debe tener host válido
    if (!url.hostname) return false;

    // Opcional: que tenga al menos un dominio y extensión (.com, .org, etc.)
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return false;

    return true;
  } catch {
    return false;
  }
}
