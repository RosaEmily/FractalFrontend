export type LogLevel = "info" | "warning" | "error" | "debug";

export interface LogDTO {
  id: number;
  message: string;
  level: LogLevel;
  level_label: string;
  action: string | null;
  entity_type: string | null;
  entity_id: number | null;
  endpoint: string | null;
  http_method: string | null;
  ip_address: string | null;
  user_name: string | null;
  /** Texto corto de apoyo. Viaja en el listado (no como `stack_trace`). */
  details: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Detalle de un log. Añade los campos pesados que el listado omite a propósito
 * (`stack_trace` ocupa páginas), y que son justo lo que se lee al abrir el ojito.
 */
export interface LogDetailDTO extends LogDTO {
  user_agent: string | null;
  file: string | null;
  line: number | null;
  /** JSON libre; la API lo devuelve ya deserializado. */
  context: unknown;
  stack_trace: string | null;
}
