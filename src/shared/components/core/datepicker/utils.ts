import dayjs from "dayjs";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.locale("es");

import type { DateArrayInput } from "./type";

export const dayjsToPrime = (format: string = "YYYY-MM-DD") => {
  return format
    .replace(/YYYY/g, "yy")
    .replace(/MM/g, "mm")
    .replace(/DD/g, "dd")
    .replace(/HH/g, "HH")
    .replace(/mm/g, "mm")
    .replace(/ss/g, "ss");
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
