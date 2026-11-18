import {
  STUDENT_IMPORT_COLUMNS,
  studentImportSchema,
} from "../../modules/students/constants/import";
import {
  TEACHER_IMPORT_COLUMNS,
  teacherImportSchema,
} from "../../modules/teachers/constants/import";
import { parseDelimited, toCsv } from "@/shared/utils/csv";
import { analyzeGrid } from "./analyze";
import { readImportFile } from "./read-file";
import {
  IMPORT_LIMITS,
  type AnalyzedRow,
  type ImportCommand,
  type ImportResult,
} from "./types";

let rows: AnalyzedRow[] = [];
let valid: AnalyzedRow[] = [];
let invalid: AnalyzedRow[] = [];
let passwords = new Map<number, string>();

const stateLabel = {
  ok: "Creado",
  failed: "Con error",
  invalid: "Sin importar",
  pending: "Pendiente",
};
const reportHeader = [
  "Fila",
  "Nombres",
  "Apellidos",
  "Correo",
  "Estado",
  "Detalle",
  "Contraseña temporal",
];

self.onmessage = async (
  event: MessageEvent<{ id: number; command: ImportCommand }>,
) => {
  const { id, command } = event.data;
  try {
    let result: unknown;
    if (command.type === "analyze") {
      rows = [];
      valid = [];
      invalid = [];
      passwords = new Map();
      const start = performance.now();
      const grid = command.file
        ? await readImportFile(command.file)
        : parseDelimited(command.text ?? "", {
            maxRows: IMPORT_LIMITS.rows + 1,
            maxColumns: IMPORT_LIMITS.columns,
            maxCellLength: IMPORT_LIMITS.cellLength,
          });
      const student = command.kind === "students";
      rows = analyzeGrid(
        grid,
        student ? STUDENT_IMPORT_COLUMNS : TEACHER_IMPORT_COLUMNS,
        student ? studentImportSchema : teacherImportSchema,
      );
      valid = rows.filter((row) => row.status === "pending");
      invalid = rows.filter((row) => row.status === "invalid");
      result = {
        total: rows.length,
        valid: valid.length,
        invalid: invalid.length,
        durationMs: performance.now() - start,
      };
    } else if (command.type === "page") {
      const selected =
        command.filter === "invalid"
          ? rows.filter((r) => r.status === "invalid" || r.status === "failed")
          : command.filter === "valid"
            ? rows.filter((r) => r.status === "pending")
            : rows;
      result = {
        total: selected.length,
        rows: selected
          .slice(command.offset, command.offset + IMPORT_LIMITS.pageSize)
          .map(({ values: _values, ...row }) => row),
      };
    } else if (command.type === "batch") {
      const batch = [];
      let bytes = 0;
      const encoder = new TextEncoder();
      for (const row of valid.slice(
        command.offset,
        command.offset + IMPORT_LIMITS.batchSize,
      )) {
        const entry = { row_number: row.n, data: row.values };
        const size = encoder.encode(JSON.stringify(entry)).byteLength;
        if (batch.length && bytes + size > 1024 * 1024) break;
        batch.push(entry);
        bytes += size;
      }
      result = batch;
    } else if (command.type === "record") {
      const byN = new Map(rows.map((row) => [row.n, row]));
      for (const item of command.results as ImportResult[]) {
        const row = byN.get(item.row_number);
        if (!row) continue;
        row.status = item.status;
        row.detail = item.detail;
        if (item.password) passwords.set(row.n, item.password);
      }
      result = {
        created: rows.filter((r) => r.status === "ok").length,
        failed: rows.filter((r) => r.status === "failed").length,
      };
    } else if (command.type === "report") {
      result = new Blob(
        [
          "\uFEFF" +
            toCsv([
              reportHeader,
              ...rows.map((row) => [
                String(row.n),
                row.raw.first_name ?? "",
                row.raw.last_name ?? "",
                row.raw.email ?? "",
                stateLabel[row.status],
                row.detail,
                passwords.get(row.n) ?? "",
              ]),
            ]),
        ],
        { type: "text/csv;charset=utf-8" },
      );
    } else {
      result = new Blob(
        [
          "\uFEFF" +
            toCsv([
              ["Fila", "Nombres", "Apellidos", "Correo", "Detalle"],
              ...invalid.map((row) => [
                String(row.n),
                row.raw.first_name ?? "",
                row.raw.last_name ?? "",
                row.raw.email ?? "",
                row.detail,
              ]),
            ]),
        ],
        { type: "text/csv;charset=utf-8" },
      );
    }
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({
      id,
      error:
        error instanceof Error ? error.message : "No se pudo leer el archivo.",
    });
  }
};
