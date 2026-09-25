import teacherRepository, {
  type AttendanceInput,
  type EvaluationInput,
  type GradeInput,
} from "../repositories/teacher.repository";
import apiFractal from "@/shared/helpers/axios/api-fractal";
import type {
  MaterialDTO,
  NotificationDTO,
  NotificationsDTO,
} from "../dto/classroom.dto";
import type {
  EvaluationTypeDTO,
  PassingScoreDTO,
  EvaluationsDTO,
  FinalsDTO,
  GradebookDTO,
  RosterDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../dto/teacher.dto";

/**
 * Servicio del docente.
 *
 * Sus respuestas ya vienen planas y con los agregados calculados (avance,
 * `weights_ok`, `can_close`), así que no llevan adapter: renombrar campos solo
 * agregaría una capa que mantener sincronizada. Es el mismo criterio que se
 * aplicó en el módulo de Reportes del admin.
 */
class TeacherService {
  /** Avisos del docente: mismo contrato que los del alumno. */
  async notifications(): Promise<NotificationsDTO | null> {
    const response = await apiFractal.get<NotificationsDTO>(
      "classroom/teacher/notifications",
    );
    return response.data;
  }

  /** Sin lista, el backend marca todos los pendientes. */
  async readNotifications(items?: NotificationDTO[]): Promise<boolean> {
    const response = await apiFractal.post(
      "classroom/teacher/notifications/read",
      { items: items ?? [] },
    );
    return response.success;
  }

  async courses(): Promise<TeacherCourseDTO[]> {
    const response = await teacherRepository.courses();
    return response.data ?? [];
  }

  async sessions(offerCourseId?: number): Promise<TeacherSessionDTO[]> {
    const response = await teacherRepository.sessions(offerCourseId);
    return response.data ?? [];
  }

  async roster(classSessionId: number): Promise<RosterDTO | null> {
    const response = await teacherRepository.roster(classSessionId);
    return response.data;
  }

  async saveAttendance(
    classSessionId: number,
    attendances: AttendanceInput[],
  ): Promise<boolean> {
    const response = await teacherRepository.saveAttendance(
      classSessionId,
      attendances,
    );
    return response.success;
  }

  async closeSession(classSessionId: number): Promise<boolean> {
    const response = await teacherRepository.closeSession(classSessionId);
    return response.success;
  }

  async evaluations(offerCourseId: number): Promise<EvaluationsDTO | null> {
    const response = await teacherRepository.evaluations(offerCourseId);
    return response.data;
  }

  async gradebook(offerCourseId: number): Promise<GradebookDTO | null> {
    const response = await teacherRepository.gradebook(offerCourseId);
    return response.data;
  }

  async finals(offerCourseId: number): Promise<FinalsDTO | null> {
    const response = await teacherRepository.finals(offerCourseId);
    return response.data;
  }

  async evaluationTypes(): Promise<EvaluationTypeDTO[]> {
    const response = await teacherRepository.evaluationTypes();
    return response.data ?? [];
  }

  /**
   * Guarda el cuadro y devuelve cómo quedó.
   *
   * ⚠️ La respuesta del POST trae ya `evaluations` y `totals` recalculados —la
   * misma forma que el GET—, así que quien guarda NO necesita volver a pedirlo:
   * hacerlo mostraba dos peticiones seguidas al mismo endpoint y dejaba una
   * ventana en la que la pantalla seguía con los datos viejos.
   */
  async saveEvaluations(
    offerCourseId: number,
    evaluations: EvaluationInput[],
  ): Promise<EvaluationsDTO | null> {
    const response = await teacherRepository.saveEvaluations(
      offerCourseId,
      evaluations,
    );
    return response.data;
  }

  async saveGrades(
    offerCourseId: number,
    grades: GradeInput[],
  ): Promise<GradebookDTO | null> {
    const response = await teacherRepository.saveGrades(offerCourseId, grades);
    return response.data;
  }

  async setPassingScore(
    offerCourseId: number,
    passingScore: number | null,
  ): Promise<PassingScoreDTO | null> {
    const response = await teacherRepository.setPassingScore(
      offerCourseId,
      passingScore,
    );
    return response.data;
  }

  async materials(classSessionId: number): Promise<MaterialDTO[]> {
    const response = await teacherRepository.materials(classSessionId);
    return response.data ?? [];
  }

  async uploadMaterial(
    classSessionId: number,
    file: File,
    options?: { name?: string; visibleFrom?: string | null },
  ): Promise<boolean> {
    const response = await teacherRepository.uploadMaterial(
      classSessionId,
      file,
      options,
    );
    return response.success;
  }

  async deleteMaterial(materialId: number): Promise<boolean> {
    const response = await teacherRepository.deleteMaterial(materialId);
    return response.success;
  }

  async closeActa(offerCourseId: number): Promise<boolean> {
    const response = await teacherRepository.closeActa(offerCourseId);
    return response.success;
  }
}

export default new TeacherService();

/** Etiquetas del estado de un curso del docente (lo deriva el backend). */
export const TEACHER_COURSE_STATE: Record<
  string,
  { label: string; tone: string }
> = {
  not_started: { label: "Por iniciar", tone: "neutral" },
  in_progress: { label: "En curso", tone: "accent" },
  completed: { label: "Cerrado", tone: "success" },
  // Pasó la fecha de fin y quedan clases sin dictar: es lo que hay que mirar.
  overdue: { label: "Atrasado", tone: "danger" },
};

/** Estado de marcado de una clase. */
export const SESSION_ATTENDANCE_STATE: Record<
  string,
  { label: string; tone: string }
> = {
  closed: { label: "Dictada", tone: "success" },
  /*
   * ⚠️ El diseño NO tiene un estado "a medias" (`sessionMeta`, shell.jsx:337):
   * son Dictada / Hoy / Pendiente. Una clase con parte de la lista marcada
   * SIGUE pendiente —lo que falta es cerrarla—, y la etiqueta larga además no
   * cabía en la columna. El detalle de cuántos van marcados ya lo dice el
   * aviso "N de M alumnos marcados".
   */
  partial: { label: "Pendiente", tone: "neutral" },
  pending: { label: "Pendiente", tone: "neutral" },
};
