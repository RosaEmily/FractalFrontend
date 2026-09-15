/**
 * Exporta las filas ya cargadas a CSV, sin pasar por la API: el reporte
 * completo ya está en memoria y el volumen de Fractal no justifica un
 * endpoint de exportación.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/**
 * Escapa un valor para CSV.
 *
 * El prefijo `'` en valores que arrancan con `= + - @` evita la inyección de
 * fórmulas: Excel ejecuta `=1+1` o `=HYPERLINK(...)` al abrir el archivo, y
 * el nombre de un programa lo carga un usuario.
 */
const escape = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";

  let text = String(value);

  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  // Comillas dobles duplicadas y el campo entre comillas si trae separadores.
  if (/["\n;,]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const exportCsv = <T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
): void => {
  const header = columns.map((column) => escape(column.header)).join(";");
  const body = rows.map((row) =>
    columns.map((column) => escape(column.value(row))).join(";"),
  );

  /*
   * Separador `;` y BOM UTF-8: sin el BOM, Excel en Windows abre las tildes
   * como caracteres rotos, y con `,` parte mal las columnas en la
   * configuración regional es-PE.
   */
  const csv = `﻿${[header, ...body].join("\r\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
