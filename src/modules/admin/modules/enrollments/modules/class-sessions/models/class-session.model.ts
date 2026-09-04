import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  ClassSessionDTO,
  ClassSessionBodyDTO,
} from "../dto/class-session.dto";

export interface ClassSession {
  id: number;
  scheduleId: number | null;
  /** Formateada para la tabla (`DD/MM/YYYY`). */
  sessionDate: string;
  /** Cruda (`YYYY-MM-DD`), la que necesita el formulario de edición. */
  sessionDateRaw: string | null;
  startTime: string | null;
  endTime: string | null;
  name: string;
  topic: string | null;
  meetLink: string | null;
  /** Cadena hacia arriba del horario, para preseleccionar los selects al editar. */
  offerId: number | null;
  offerCourseId: number | null;
  courseName: string | null;
  status: number;
  updated_at: string;
}

export interface ClassSessionRepositoryTypes {
  base: RepositoryBase<ClassSession, ClassSessionDTO>;
  create: { body: ClassSessionBodyDTO };
  update: { body: ClassSessionBodyDTO };
}
