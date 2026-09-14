import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { LogDetailDTO, LogDTO, LogLevel } from "../dto/log.dto";

export interface Log {
  id: number;
  message: string;
  level: LogLevel;
  levelLabel: string;
  action: string | null;
  /** "Curso #12" — tipo y id juntos, como en el diseño. Para MOSTRAR. */
  entity: string | null;
  /** El tipo crudo (`Tag`, `Enrollment`). Es por donde filtra y ordena el listado. */
  entityType: string | null;
  endpoint: string | null;
  httpMethod: string | null;
  ipAddress: string | null;
  userName: string | null;
  details: string | null;
  createdAt: string;
  updated_at: string;
}

/** Lo que muestra el diálogo del ojito. */
export interface LogDetail extends Log {
  userAgent: string | null;
  /** `archivo:línea` — origen del error, ya unido. */
  origin: string | null;
  /** Ya formateado como JSON legible; null si el log no traía contexto. */
  context: string | null;
  stackTrace: string | null;
}

export interface LogRepositoryTypes {
  base: RepositoryBase<Log, LogDTO>;
  /** `edit()` pega contra `show`, que sí devuelve los campos pesados. */
  edit: { model: LogDetail; dto: LogDetailDTO };
}
