import teacherRepository, {
  type AttendanceInput,
  type EvaluationInput,
  type GradeInput,
} from "../repositories/teacher.repository";
import type { MaterialDTO } from "../dto/classroom.dto";
import type {
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

  async saveEvaluations(
    offerCourseId: number,
    evaluations: EvaluationInput[],
  ): Promise<boolean> {
    const response = await teacherRepository.saveEvaluations(
      offerCourseId,
      evaluations,
    );
    return response.success;
  }

  async saveGrades(
    offerCourseId: number,
    grades: GradeInput[],
  ): Promise<boolean> {
    const response = await teacherRepository.saveGrades(offerCourseId, grades);
    return response.success;
  }

  async setPassingScore(
    offerCourseId: number,
    passingScore: number | null,
  ): Promise<boolean> {
    const response = await teacherRepository.setPassingScore(
      offerCourseId,
      passingScore,
    );
    return response.success;
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
  partial: { label: "Marcada a medias", tone: "warning" },
  pending: { label: "Pendiente", tone: "neutral" },
};
