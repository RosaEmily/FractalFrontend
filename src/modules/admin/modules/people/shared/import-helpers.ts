import { normalizeKey } from "@/shared/utils/csv";
import type { SelectOption } from "@/modules/admin/constants/options";

/** "Masculino" / "masculino" / "m" → "m". Si no coincide se devuelve tal cual y el esquema lo rechaza. */
export const optionMapper =
  (options: SelectOption[]) =>
  (raw: string): string => {
    const key = normalizeKey(raw);
    const hit = options.find(
      (o) => normalizeKey(String(o.label)) === key || normalizeKey(String(o.value)) === key,
    );
    return hit ? String(hit.value) : raw;
  };

/** "25/03/1995" o "1995-03-25" → "1995-03-25". */
export const dateMapper = (raw: string): string => {
  const m = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  return m ? `${m[3]}-${(m[2] ?? "").padStart(2, "0")}-${(m[1] ?? "").padStart(2, "0")}` : raw;
};

/** Solo dígitos o letras: Excel suele añadir espacios o ceros de formato. */
export const compact = (raw: string): string => raw.replace(/\s+/g, "");

export const numberMapper = (raw: string): number | string => {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : raw;
};
