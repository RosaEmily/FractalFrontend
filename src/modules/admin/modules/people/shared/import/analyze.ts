import type { ZodTypeAny } from "zod";
import { normalizeKey } from "@/shared/utils/csv";
import { IMPORT_LIMITS, type AnalyzedRow, type ImportColumn } from "./types";

export function analyzeGrid(
  grid: unknown[][],
  columns: ImportColumn[],
  schema: ZodTypeAny,
): AnalyzedRow[] {
  const byKey = new Map<string, ImportColumn>();
  for (const column of columns) {
    for (const key of [column.key, column.label, ...(column.aliases ?? [])])
      byKey.set(normalizeKey(key), column);
  }
  const first = (grid[0] ?? []).map((cell) =>
    byKey.get(normalizeKey(String(cell ?? ""))),
  );
  const hasHeader = first.filter(Boolean).length >= 2;
  const order = hasHeader ? first : columns;
  if (hasHeader) {
    const found = first.filter((c): c is ImportColumn => !!c);
    if (new Set(found.map((c) => c.key)).size !== found.length)
      throw new Error("Hay columnas repetidas en la cabecera.");
    const missing = columns.filter((c) => c.required && !found.includes(c));
    if (missing.length)
      throw new Error(
        `Faltan columnas: ${missing.map((c) => c.label).join(", ")}. Usa la plantilla.`,
      );
  }
  const rows: AnalyzedRow[] = [];
  const seen = new Map<string, Map<string, number>>();
  for (let index = hasHeader ? 1 : 0; index < grid.length; index++) {
    const cells = grid[index] ?? [];
    if (
      !cells.some(
        (c) => c !== null && c !== undefined && String(c).trim() !== "",
      )
    )
      continue;
    if (rows.length >= IMPORT_LIMITS.rows)
      throw new Error(
        `Máximo ${IMPORT_LIMITS.rows.toLocaleString("es-PE")} registros por archivo.`,
      );
    if (cells.length > IMPORT_LIMITS.columns)
      throw new Error(
        "El archivo tiene demasiadas columnas. Usa la plantilla.",
      );
    const values: Record<string, unknown> = {};
    const raw: Record<string, string> = {};
    const errors: string[] = [];
    const n = index + 1;
    order.forEach((column, i) => {
      if (!column) return;
      const original = cells[i];
      const text =
        original instanceof Date
          ? original.toISOString().slice(0, 10)
          : String(original ?? "").trim();
      if (text.length > IMPORT_LIMITS.cellLength)
        errors.push(
          `${column.label}: máximo ${IMPORT_LIMITS.cellLength} caracteres`,
        );
      raw[column.key] = text;
      values[column.key] =
        text === "" ? undefined : column.map ? column.map(text) : text;
    });
    const documentIndex = order.findIndex((c) => c?.key === "document_number");
    if (
      typeof cells[documentIndex] === "number" &&
      Number.isInteger(cells[documentIndex])
    ) {
      const width =
        values.document_type === "DNI"
          ? 8
          : values.document_type === "CE"
            ? 9
            : 0;
      if (width)
        values.document_number = raw.document_number = String(
          cells[documentIndex],
        ).padStart(width, "0");
    }
    for (const key of ["first_name", "last_name", "email"]) {
      if (typeof values[key] === "string")
        values[key] = (values[key] as string).trim();
    }
    if (typeof values.email === "string")
      values.email = values.email.toLowerCase();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues.slice(0, 8)) {
        errors.push(
          `${columns.find((c) => c.key === issue.path[0])?.label ?? issue.path.join(".")}: ${issue.message}`,
        );
      }
    }
    for (const key of ["email", "document_number"]) {
      const value = String(values[key] ?? "").toLowerCase();
      if (!value) continue;
      const map = seen.get(key) ?? new Map<string, number>();
      if (map.has(value))
        errors.push(
          `${columns.find((c) => c.key === key)?.label}: repetido en la fila ${map.get(value)}`,
        );
      seen.set(key, map);
    }
    if (parsed.success && !errors.length) {
      for (const key of ["email", "document_number"]) {
        const value = String(values[key] ?? "").toLowerCase();
        if (value) seen.get(key)?.set(value, n);
      }
    }
    rows.push({
      n,
      raw: Object.fromEntries(
        ["first_name", "last_name", "email"].map((k) => [k, raw[k] ?? ""]),
      ),
      values: parsed.success
        ? (parsed.data as Record<string, unknown>)
        : values,
      status: errors.length ? "invalid" : "pending",
      detail: errors.slice(0, 8).join(" · "),
    });
  }
  if (!rows.length)
    throw new Error(
      "El archivo no contiene registros. Añade datos debajo de la cabecera.",
    );
  return rows;
}
