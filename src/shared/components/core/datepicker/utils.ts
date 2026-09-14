import dayjs from "dayjs";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.locale("es");

import type { DateArrayInput } from "./type";

/**
 * Formato de dayjs → formato de `dateFormat` de PrimeVue.
 *
 * ⚠️ El `dateFormat` de PrimeVue solo entiende tokens de FECHA (`d`, `m`, `y`);
 * la hora la añade él por su cuenta según `showTime` y `hourFormat`. Si se le
 * cuela un `HH:mm` lo imprime literal y el input queda como
 * `05/09/2026 HH:09 14:03` — el `09` es el mes filtrándose en el hueco de la
 * hora. Por eso la parte horaria se recorta aquí.
 */
export const dayjsToPrime = (format: string = "YYYY-MM-DD") => {
  return format
    .replace(/[HhmsAa:.]+\s*$/g, "")
    .trim()
    .replace(/YYYY/g, "yy")
    // `YY` (año corto) también existe en dayjs; PrimeVue lo escribe `y`.
    .replace(/YY/g, "y")
    .replace(/MM/g, "mm")
    .replace(/DD/g, "dd");
};

export const serializeDate = (
  d: DateArrayInput,
  format: string = "YYYY-MM-DD",
  utcFlag: boolean = false,
): string | (string | null)[] | null => {
  if (d == null) return null;

  const serializeItem = (item: Date | string | null | undefined) => {
    if (!item) return null;

    const parsed = utcFlag ? dayjs(item).utc() : dayjs(item);

    if (!parsed.isValid()) return null;

    return utcFlag ? parsed.toISOString() : parsed.format(format);
  };
  return Array.isArray(d) ? d.map(serializeItem) : serializeItem(d);
};

export const parseDate = (
  v: string | (string | null)[] | null,
  format: string = "YYYY-MM-DD",
  utcFlag: boolean = false,
): Date | (Date | null)[] | null => {
  if (v == null) return null;

  const parseItem = (item: string | null) => {
    if (!item) return null;

    const parsed = utcFlag ? dayjs.utc(item) : dayjs(item, format, true);

    return parsed.isValid() ? parsed.toDate() : null;
  };

  return Array.isArray(v) ? v.map(parseItem) : parseItem(v);
};
