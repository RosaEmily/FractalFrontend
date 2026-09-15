import { WEEKDAY_LABEL, WEEKDAY_ORDER } from "../constants/labels";

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "set",
  "oct",
  "nov",
  "dic",
];

const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "setiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Solo la parte de fecha de un valor de la API.
 *
 * Los datetime llegan como `2026-09-01 19:00:00` o en ISO con `T`. Se corta el
 * string en vez de usar `new Date`, que interpretaría el ISO como UTC y en
 * Lima (-5) devolvería el día anterior.
 */
export const toDay = (value: string | null | undefined): string =>
  value ? (String(value).split(/[ T]/)[0] ?? "") : "";

/** `2026-09-01` → `1 set` (o `1 set 2026` con `withYear`). */
export const formatDate = (
  value: string | null | undefined,
  withYear = false,
): string => {
  const day = toDay(value);
  if (!day) return "—";

  const [year, month, date] = day.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const base = `${date} ${MONTHS_SHORT[month - 1] ?? ""}`;
  return withYear ? `${base} ${year}` : base;
};

/** `2026-09` → `setiembre 2026`. Encabeza los grupos del cronograma. */
export const formatMonth = (value: string | null | undefined): string => {
  const day = toDay(value);
  if (!day) return "—";

  const [year, month] = day.split("-").map(Number) as [number, number];
  return `${MONTHS_LONG[month - 1] ?? ""} ${year}`;
};

/** `19:00:00` → `19:00`. */
export const formatTime = (value: string | null | undefined): string =>
  value ? String(value).slice(0, 5) : "—";

/** Rango horario de una clase: `19:00–21:00`. */
export const formatTimeRange = (
  start: string | null | undefined,
  end: string | null | undefined,
): string => `${formatTime(start)}–${formatTime(end)}`;

/**
 * Día de la semana de una fecha, en la clave que usa `schedules.day_of_week`.
 * Se construye en UTC para que el desfase horario no corra el día.
 */
export const weekdayKey = (value: string | null | undefined): string => {
  const day = toDay(value);
  if (!day) return "";

  const [year, month, date] = day.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const jsDay = new Date(Date.UTC(year, month - 1, date)).getUTCDay();
  // getUTCDay: 0 = domingo. La semana del diseño empieza en lunes.
  return WEEKDAY_ORDER[(jsDay + 6) % 7] ?? "";
};

export const weekdayLabel = (value: string | null | undefined): string =>
  WEEKDAY_LABEL[weekdayKey(value)] ?? "—";

/** Días calendario entre dos fechas. Negativo si la segunda ya pasó. */
export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(toDay(to)) - Date.parse(toDay(from))) / 86400000);

/** Suma días a una fecha `Y-m-d`. */
export const addDays = (value: string, amount: number): string =>
  new Date(Date.parse(toDay(value)) + amount * 86400000)
    .toISOString()
    .slice(0, 10);

/** Lunes de la semana de esa fecha: el ancla de la rejilla del cronograma. */
export const mondayOf = (value: string): string =>
  addDays(value, -WEEKDAY_ORDER.indexOf(weekdayKey(value)));

/** `19:30` → 1170. Posiciona los bloques en la rejilla horaria. */
export const minutesOf = (time: string | null | undefined): number => {
  if (!time) return 0;
  const [hours, minutes] = String(time).split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes || 0);
};

/**
 * Nota en escala 0-20, sin decimales inútiles: `16.80` → `16.8`, `17.00` → `17`.
 * Null muestra guion, nunca 0 — un 0 se leería como "desaprobó".
 */
export const formatScore = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? "—"
    : String(Number(value.toFixed(2)));

/** Porcentaje; null es "sin datos", que no es lo mismo que 0%. */
export const formatPercent = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${Math.round(value)}%`;

/** Monto con el símbolo de su moneda. */
export const formatMoney = (
  amount: number | null | undefined,
  symbol = "S/",
  decimals = 2,
): string => {
  if (amount === null || amount === undefined) return "—";
  return `${symbol} ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/** Peso de archivo legible: 6291456 → `6 MB`. */
export const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes) return "—";
  if (bytes >= 1048576) {
    return `${Number((bytes / 1048576).toFixed(1))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};
