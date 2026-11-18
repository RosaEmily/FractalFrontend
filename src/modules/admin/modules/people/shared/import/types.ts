export interface ImportColumn {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
  example?: string;
  map?: (raw: string) => unknown;
}

export type ImportKind = "students" | "teachers";
export type RowFilter = "all" | "invalid" | "valid";
export interface PreviewRow {
  n: number;
  raw: Record<string, string>;
  status: "pending" | "invalid" | "ok" | "failed";
  detail: string;
}
export interface AnalyzedRow extends PreviewRow {
  values: Record<string, unknown>;
}
export interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  durationMs: number;
}
export interface ImportResult {
  row_number: number;
  status: "ok" | "failed";
  detail: string;
  password: string | null;
}
export type ImportCommand =
  | { type: "analyze"; kind: ImportKind; file?: File; text?: string }
  | { type: "page"; offset: number; filter: RowFilter }
  | { type: "batch"; offset: number }
  | { type: "record"; results: ImportResult[] }
  | { type: "errors" }
  | { type: "report" };

export const IMPORT_LIMITS = {
  rows: 1000,
  fileBytes: 2 * 1024 * 1024,
  columns: 32,
  cellLength: 4096,
  pageSize: 25,
  batchSize: 50,
};
