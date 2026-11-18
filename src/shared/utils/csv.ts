/**
 * Lectura y escritura de CSV/TSV sin librerías.
 *
 * Excel copia las celdas separadas por TAB; los archivos .csv usan coma o punto
 * y coma según la región. El separador se detecta en la primera línea.
 */

const detectDelimiter = (firstLine: string): string => {
  let best = ",";
  let max = 0;
  for (const d of ["\t", ";", ","]) {
    const n = firstLine.split(d).length - 1;
    if (n > max) {
      max = n;
      best = d;
    }
  }
  return best;
};

/** Convierte el texto en filas de celdas (respeta comillas y saltos dentro de comillas). */
export function parseDelimited(text: string): string[][] {
  const clean = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const delimiter = detectDelimiter(clean.split("\n", 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (quoted) {
      if (char === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);

  return rows
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ""));
}

/**
 * Evita la inyección de fórmulas al abrir el CSV en Excel: una celda que
 * empieza con = + - @ se ejecutaría como fórmula. Se antepone una comilla.
 */
const safeCell = (value: string): string => {
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => safeCell(String(c ?? ""))).join(",")).join("\n");
}

export function downloadCsv(filename: string, rows: string[][]): void {
  // BOM para que Excel respete las tildes.
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Minúsculas y sin tildes: "Género" y "genero" son la misma cabecera. */
export const normalizeKey = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
