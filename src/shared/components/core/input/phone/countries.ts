import peFlag from "flag-icons/flags/4x3/pe.svg";

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2. */
  iso: string;
  name: string;
  /** Código de llamada sin "+". */
  dial: string;
  /** SVG empaquetado solo para los países habilitados (no todo el set de banderas). */
  flag: string;
  /** Número nacional válido (solo dígitos). */
  pattern: RegExp;
  /** Cómo se agrupa al escribir: [3, 3, 3] → 987 654 321. */
  groups: number[];
}

/**
 * Países habilitados. Para sumar uno: importa su bandera de flag-icons y
 * agrégalo aquí con su patrón; sin librerías de teléfono (pesaban 150 kB).
 * La API valida de nuevo (`PeruvianMobile`): ampliarla en el mismo cambio.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    iso: "PE",
    name: "Perú",
    dial: "51",
    flag: peFlag,
    pattern: /^9\d{8}$/,
    groups: [3, 3, 3],
  },
];

/** Agrupa los dígitos según el país: "987654321" → "987 654 321". */
export function formatNational(country: PhoneCountry, digits: string): string {
  const parts: string[] = [];
  let rest = digits.slice(0, country.groups.reduce((a, b) => a + b, 0));
  for (const size of country.groups) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return parts.join(" ");
}

/** Busca el país de un número E.164 y devuelve el país y su parte nacional. */
export function splitE164(value: string) {
  const clean = value.replace(/\s/g, "");
  for (const country of PHONE_COUNTRIES) {
    if (clean.startsWith(`+${country.dial}`)) {
      return { country, national: clean.slice(country.dial.length + 1) };
    }
  }
  return null;
}

/** ¿Es un número E.164 de un país habilitado y con formato válido? */
export function isValidPhone(value: string): boolean {
  const parts = splitE164(value);
  return !!parts && parts.country.pattern.test(parts.national);
}
