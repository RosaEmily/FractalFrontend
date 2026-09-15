import dayjs from "dayjs";
import type { Log, LogDetail } from "../models/log.model";
import type { LogDetailDTO, LogDTO } from "../dto/log.dto";

export const LogAdapter = {
  one: (dto: LogDTO): Log => ({
    id: dto.id,
    message: dto.message,
    level: dto.level,
    levelLabel: dto.level_label,
    action: dto.action,
    entity: dto.entity_type
      ? `${dto.entity_type}${dto.entity_id ? ` #${dto.entity_id}` : ""}`
      : null,
    entityType: dto.entity_type,
    endpoint: dto.endpoint,
    httpMethod: dto.http_method,
    ipAddress: dto.ip_address,
    userName: dto.user_name,
    details: dto.details,
    createdAt: dto.created_at
      ? dayjs(dto.created_at).format("DD/MM/YYYY HH:mm")
      : "—",
    updated_at: dto.updated_at,
  }),

  many: (dtos: LogDTO[]): Log[] => dtos.map((dto) => LogAdapter.one(dto)),
};

/** El contexto llega como JSON libre; se muestra indentado o no se muestra. */
const formatContext = (context: unknown): string | null => {
  if (context === null || context === undefined) return null;
  if (typeof context === "string") return context.trim() || null;

  try {
    const json = JSON.stringify(context, null, 2);
    // `{}` y `[]` son "sin contexto": ocupan una fila sin decir nada.
    return json && json !== "{}" && json !== "[]" ? json : null;
  } catch {
    return null;
  }
};

export const LogDetailAdapter = {
  one: (dto: LogDetailDTO): LogDetail => ({
    ...LogAdapter.one(dto),
    userAgent: dto.user_agent,
    // Archivo y línea se leen siempre juntos; separados obligan a cruzarlos a ojo.
    origin: dto.file ? `${dto.file}${dto.line ? `:${dto.line}` : ""}` : null,
    context: formatContext(dto.context),
    stackTrace: dto.stack_trace,
  }),

  many: (dtos: LogDetailDTO[]): LogDetail[] =>
    dtos.map((dto) => LogDetailAdapter.one(dto)),
};
