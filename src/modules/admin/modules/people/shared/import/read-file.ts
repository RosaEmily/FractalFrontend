import { parseDelimited } from "@/shared/utils/csv";
import { IMPORT_LIMITS } from "./types";

export function checkXlsxArchive(buffer: ArrayBuffer): void {
  const view = new DataView(buffer);
  let end = buffer.byteLength - 22;
  const min = Math.max(0, end - 65535);
  while (end >= min && view.getUint32(end, true) !== 0x06054b50) end--;
  if (end < min)
    throw new Error(
      "No se pudo leer el archivo XLSX. Guárdalo de nuevo desde Excel.",
    );
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  let expanded = 0;
  if (count > 2048)
    throw new Error(
      "El libro tiene demasiados elementos. Copia los datos a un libro nuevo.",
    );
  for (let i = 0; i < count; i++) {
    if (at + 46 > buffer.byteLength || view.getUint32(at, true) !== 0x02014b50)
      throw new Error("El archivo XLSX está dañado.");
    expanded += view.getUint32(at + 24, true);
    if (expanded > 20 * 1024 * 1024)
      throw new Error(
        "El contenido del libro es demasiado grande. Divide el archivo.",
      );
    at +=
      46 +
      view.getUint16(at + 28, true) +
      view.getUint16(at + 30, true) +
      view.getUint16(at + 32, true);
  }
}

export async function readImportFile(file: File): Promise<unknown[][]> {
  if (file.size > IMPORT_LIMITS.fileBytes)
    throw new Error("Máximo 2 MB por archivo.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "xlsx") {
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength < 22)
      throw new Error("El archivo XLSX está vacío o dañado.");
    checkXlsxArchive(buffer);
    const { readSheet } = await import("read-excel-file/browser");
    return readSheet(buffer);
  }
  if (!["csv", "tsv", "txt"].includes(extension ?? ""))
    throw new Error("Elige un archivo XLSX, CSV o TSV.");
  return parseDelimited(await file.text(), {
    maxRows: IMPORT_LIMITS.rows + 1,
    maxColumns: IMPORT_LIMITS.columns,
    maxCellLength: IMPORT_LIMITS.cellLength,
  });
}
