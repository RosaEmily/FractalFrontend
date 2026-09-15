import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { MaterialDTO } from "../dto/classroom.dto";
import type {
  EvaluationsDTO,
  FinalsDTO,
  GradebookDTO,
  RosterDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../dto/teacher.dto";

/** Una evaluación del cuadro. Sin `id` se crea; con `id` se actualiza. */
export interface EvaluationInput {
  id?: number | null;
  name: string;
  evaluation_type_id: number;
  weight: number;
  max_score: number;
}

/** Una celda de la matriz de notas. `score` null borra la calificación. */
export interface GradeInput {
  enrollment_course_id: number;
  course_evaluation_id: number;
  score: number | null;
  feedback?: string | null;
}

/** Marca de asistencia de un alumno en una clase. */
export interface AttendanceInput {
  enrollment_course_id: number;
  /** 0 ausente · 1 presente · 2 tardanza. */
  attended: number;
}

/**
 * Endpoints del docente.
 *
 * Ninguno recibe su documento: la API lo deriva del token y además verifica
 * autoría (que el curso o la sesión sean suyos). Un curso ajeno responde 404.
 */
class TeacherRepository {
  private route = "classroom/teacher";

  async courses(): Promise<ApiResponse<TeacherCourseDTO[]>> {
    const response = await apiFractal.get<TeacherCourseDTO[]>(
      `${this.route}/courses`,
    );
    return { ...response, data: response.data ?? [] };
  }

  async sessions(offerCourseId?: number): Promise<ApiResponse<TeacherSessionDTO[]>> {
    const response = await apiFractal.get<TeacherSessionDTO[]>(
      `${this.route}/sessions`,
      { params: offerCourseId ? { offer_course_id: offerCourseId } : undefined },
    );
    return { ...response, data: response.data ?? [] };
  }

  async roster(classSessionId: number): Promise<ApiResponse<RosterDTO | null>> {
    return apiFractal.get<RosterDTO>(
      `${this.route}/sessions/${classSessionId}/roster`,
    );
  }

  /**
   * Pasa lista. Es un upsert por (clase, alumno): volver a enviarla corrige la
   * marca en vez de duplicarla, así que se manda la lista completa.
   */
  async saveAttendance(
    classSessionId: number,
    attendances: AttendanceInput[],
  ): Promise<ApiResponse<unknown>> {
    return apiFractal.post(
      `${this.route}/sessions/${classSessionId}/attendance`,
      { attendances },
    );
  }

  /** Cierra la clase (status 0 → 1): recién ahí cuenta para el avance. */
  async closeSession(classSessionId: number): Promise<ApiResponse<unknown>> {
    return apiFractal.post(
      `${this.route}/sessions/${classSessionId}/close`,
      {},
    );
  }

  async evaluations(offerCourseId: number): Promise<ApiResponse<EvaluationsDTO | null>> {
    return apiFractal.get<EvaluationsDTO>(
      `${this.route}/courses/${offerCourseId}/evaluations`,
    );
  }

  /**
   * Guarda el cuadro completo: lo que no se envía se elimina. Una evaluación
   * con notas no se borra ni cambia de peso — la API lo reporta en `protected`.
   */
  async saveEvaluations(
    offerCourseId: number,
    evaluations: EvaluationInput[],
  ): Promise<ApiResponse<unknown>> {
    return apiFractal.post(
      `${this.route}/courses/${offerCourseId}/evaluations`,
      { evaluations },
    );
  }

  async gradebook(offerCourseId: number): Promise<ApiResponse<GradebookDTO | null>> {
    return apiFractal.get<GradebookDTO>(
      `${this.route}/courses/${offerCourseId}/gradebook`,
    );
  }

  /** Toda la matriz en una llamada. Upsert: volver a guardar corrige. */
  async saveGrades(
    offerCourseId: number,
    grades: GradeInput[],
  ): Promise<ApiResponse<unknown>> {
    return apiFractal.post(
      `${this.route}/courses/${offerCourseId}/gradebook`,
      { grades },
    );
  }

  /** `null` devuelve el curso a la nota aprobatoria que define el catálogo. */
  async setPassingScore(
    offerCourseId: number,
    passingScore: number | null,
  ): Promise<ApiResponse<unknown>> {
    return apiFractal.patch(
      `${this.route}/courses/${offerCourseId}/passing-score`,
      { passing_score: passingScore },
    );
  }

  // ─── Material de clase ──────────────────────────────────────────────────

  async materials(classSessionId: number): Promise<ApiResponse<MaterialDTO[]>> {
    const response = await apiFractal.get<MaterialDTO[]>(
      `${this.route}/sessions/${classSessionId}/materials`,
    );
    return { ...response, data: response.data ?? [] };
  }

  /**
   * Sube un archivo. Va como FormData, así que hay que pisar el
   * `Content-Type: application/json` que fija el cliente axios.
   */
  async uploadMaterial(
    classSessionId: number,
    file: File,
    options?: { name?: string; visibleFrom?: string | null },
  ): Promise<ApiResponse<unknown>> {
    const form = new FormData();
    form.append("file", file);
    if (options?.name) form.append("name", options.name);
    if (options?.visibleFrom) form.append("visible_from", options.visibleFrom);

    return apiFractal.post(
      `${this.route}/sessions/${classSessionId}/materials`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  }

  async deleteMaterial(materialId: number): Promise<ApiResponse<unknown>> {
    return apiFractal.delete(`${this.route}/materials/${materialId}`);
  }

  async finals(offerCourseId: number): Promise<ApiResponse<FinalsDTO | null>> {
    return apiFractal.get<FinalsDTO>(
      `${this.route}/courses/${offerCourseId}/finals`,
    );
  }

  /**
   * Cierra el acta. El backend calcula la nota final y decide la aprobación:
   * no se le manda ninguna nota desde acá.
   */
  async closeActa(offerCourseId: number): Promise<ApiResponse<unknown>> {
    return apiFractal.post(
      `${this.route}/courses/${offerCourseId}/finals/close`,
      {},
    );
  }
}

export default new TeacherRepository();
