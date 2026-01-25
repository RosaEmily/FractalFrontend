import type { GridUiColumnProps } from "../column/type";
import { formatNumber } from "@/shared/utils/format";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export const formatValue = <T>(col: GridUiColumnProps<T>, row: T) => {
  const value = row[col.field];
  switch (col.type) {
    case "currency":
      return formatCurrency(col, row);
    case "number":
      return typeof value === "number" || typeof value === "string"
        ? formatNumber(value, col.number?.formatOptions)
        : "";
    case "date": {
      const fmt = col.date?.format ?? "DD/MM/YYYY hh:mm:ss A";
      return typeof value === "string" ||
        typeof value === "number" ||
        value instanceof Date ||
        dayjs.isDayjs(value)
        ? dayjs(value).format(fmt)
        : "";
    }
    default:
      return value;
  }
};

export const formatCurrency = <T>(col: GridUiColumnProps<T>, row: T) => {
  const cfg = col.currency ?? {};
  const value = row[col.field];
  const symbol = (cfg.key ? row[cfg.key] : cfg.symbol) ?? "S/";
  const formatted =
    typeof value === "number" || typeof value === "string"
      ? formatNumber(value, col.number?.formatOptions)
      : "";
  return cfg.position === "right"
    ? `${formatted} ${symbol}`
    : `${symbol} ${formatted}`;
};

export const formatUrlValue = <T>(col: GridUiColumnProps<T>, row: T) => {
  const cfg = col.url ?? {};
  const value = row[col.field];
  const href = cfg.hrefKey ? row[cfg.hrefKey] : value;
  const text = cfg.textKey
    ? (row[cfg.textKey] ?? cfg.fallbackText ?? href)
    : (cfg.fallbackText ?? href);
  return { href, text };
};
