/**
 * Lectura y escritura de CSV/TSV sin librerías.
 *
 * Excel copia las celdas separadas por TAB; los archivos .csv usan coma o punto
 * y coma según la región. El separador se detecta en la primera línea.
 */

const detectDelimiter = (firstLine: string): string => {
  let quoted = false;
  let outside = "";
  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    if (char === '"' && quoted && firstLine[i + 1] === '"') {
      i++;
      continue;
    }
    if (char === '"') quoted = !quoted;
    else if (!quoted) outside += char;
  }
  let best = ",";
  let max = 0;
  for (const d of ["\t", ";", ","]) {
    const n = outside.split(d).length - 1;
    if (n > max) {
      max = n;
      best = d;
    }
  }
  return best;
};

/** Convierte el texto en filas de celdas (respeta comillas y saltos dentro de comillas). */
export function parseDelimited(
  text: string,
  limits: {
    maxRows?: number;
    maxColumns?: number;
    maxCellLength?: number;
  } = {},
): string[][] {
  const clean = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const delimiter = detectDelimiter(clean.split("\n", 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const pushCell = () => {
    if (row.length >= (limits.maxColumns ?? Infinity))
      throw new Error("El archivo tiene demasiadas columnas.");
    row.push(cell.trim());
    cell = "";
  };
  const pushRow = () => {
    if (row.some(Boolean)) {
      if (rows.length >= (limits.maxRows ?? Infinity))
        throw new Error("El archivo supera el máximo de registros permitido.");
      rows.push(row);
    }
    row = [];
  };

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
      pushCell();
    } else if (char === "\n") {
      pushCell();
      pushRow();
    } else {
      cell += char;
    }
    if (cell.length > (limits.maxCellLength ?? Infinity))
      throw new Error("Una celda supera el tamaño permitido.");
  }
  if (quoted)
    throw new Error(
      "Hay una celda con comillas sin cerrar. Revisa el archivo.",
    );
  pushCell();
  pushRow();
  return rows;
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
  return rows
    .map((r) => r.map((c) => safeCell(String(c ?? ""))).join(","))
    .join("\n");
}

export function downloadCsv(filename: string, rows: string[][]): void {
  // BOM para que Excel respete las tildes.
  const blob = new Blob(["﻿" + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
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
