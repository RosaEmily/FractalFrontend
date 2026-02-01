import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export const formatPaddedValue = (
  value: number | string | undefined | null,
  length: number = 2,
  fill: string = "0",
): string => {
  return String(value ?? "").padStart(length, fill);
};

export function formatLengthLabel({
  value,
  max = 0,
  text = "caracteres",
  separator = "/",
}: {
  value?: string | null;
  max?: number | null;
  text?: string;
  separator?: string;
}): string {
  const cleanValue = value?.trim() ?? "";
  const min = cleanValue.length;
  return `${min} ${separator} ${max} ${text}`;
}

export const convertTo24Hour = (timeStr: string): string | null => {
  if (!timeStr) return null;

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let [, hourStr, minuteStr, meridian] = match;

  let hours = Number(hourStr);
  const minutes = Number(minuteStr);

  if (minutes > 59 || hours < 1 || hours > 12) return null;

  const isAM = meridian?.toUpperCase() === "AM";

  if (hours === 12) {
    hours = isAM ? 0 : 12;
  } else if (!isAM) {
    hours += 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatDate = {
  // 👉 "Jue. 15 de Junio 2025 a las 5:30 PM"
  full(date: string | Date) {
    const d = dayjs(date);
    const dayShort = capitalize(d.format("ddd")); // jue. → Jue.
    const dayNumber = d.format("D");
    const month = capitalize(d.format("MMMM"));
    const year = d.format("YYYY");
    const time = d.format("h:mm A");
    return `${dayShort} ${dayNumber} de ${month} ${year} a las ${time}`;
  },

  // 👉 "Jueves 15 de Junio 2025 a las 5:30 PM"
  fullLongDay(date: string | Date) {
    const d = dayjs(date);
    const dayLong = capitalize(d.format("dddd")); // jueves → Jueves
    const dayNumber = d.format("D");
    const month = capitalize(d.format("MMMM"));
    const year = d.format("YYYY");
    const time = d.format("h:mm A");
    return `${dayLong} ${dayNumber} de ${month} ${year} a las ${time}`;
  },

  // 👉 "15 Junio | 5:30PM"
  short(date: string | Date) {
    const d = dayjs(date);
    const dayNumber = d.format("D");
    const month = capitalize(d.format("MMMM"));
    const time = d.format("h:mm A");
    return `${dayNumber} ${month} | ${time}`;
  },

  // 👉 "Sábado 20 de Noviembre"
  onlyDate(date: string | Date) {
    const d = dayjs(date);
    return capitalize(d.format("dddd D [de] MMMM"));
  },

  // 👉 "5:30 PM"
  onlyTime(date: string | Date) {
    return dayjs(date).format("h:mm A");
  },

  // 👉 "31 Ago, 2024"
  shortWithMonthAbbr(date: string | Date) {
    const d = dayjs(date);
    const day = d.format("D");
    const monthAbbr = capitalize(d.format("MMM")); // ago → Ago
    const year = d.format("YYYY");
    return `${day} ${monthAbbr}, ${year}`;
  },

  // 👉 "25 de agosto a las 3:26 p.m."
  shortDateWithTime(date: string | Date) {
    return dayjs(date)
      .format("D [de] MMMM [a las] h:mm a")
      .replace("am", "a.m")
      .replace("pm", "p.m");
  },

  // 👉 Formato personalizado, con capitalización opcional
  custom(date: string | Date, format: string) {
    const d = dayjs(date);
    let output = d.format(format);

    // Capitalización automática si detecta tokens de día o mes
    // (MMMM, dddd, ddd → capitalizar palabras)
    const needsCapitalize = ["MMMM", "dddd", "ddd"].some((token) =>
      format.includes(token),
    );

    if (needsCapitalize) {
      output = output
        .split(" ")
        .map((word) => capitalize(word))
        .join(" ");
    }

    return output;
  },
};

export const formatNumber = (
  value?: number | string | null,
  options?: Intl.NumberFormatOptions,
): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  const defaultOptions: Intl.NumberFormatOptions =
    num % 1 === 0 ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return num.toLocaleString("en-US", { ...defaultOptions, ...options });
};

export const formatNumberCompact = (
  value?: number | string | null,
  options?: Intl.NumberFormatOptions,
): string => {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (Number.isNaN(num)) return "";

  const abs = Math.abs(num);

  const UNITS = [
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "k" },
  ];

  const unit = UNITS.find(({ limit }) => abs >= limit);

  if (!unit) {
    return formatNumber(num, options);
  }

  return `+${formatNumber(num / unit.limit, options)}${unit.suffix}`;
};

export const slugify = (input: string | number | boolean | unknown): string => {
  const text = String(input).trim().toLowerCase();
  return text
    .normalize("NFD") // descompone tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina diacríticos
    .replace(/[^\p{L}\p{N}]+/gu, "-") // reemplaza todo lo que no sea letra o número por guion
    .replace(/-+/g, "-") // unifica múltiples guiones
    .replace(/^-|-$/g, ""); // elimina guion al inicio o final
};
