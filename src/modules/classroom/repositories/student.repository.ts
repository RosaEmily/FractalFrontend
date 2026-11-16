import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type {
  NotificationDTO,
  NotificationsDTO,
  StudentCertificateDTO,
  StudentCourseDTO,
} from "../dto/classroom.dto";
import type {
  StudentCertificate,
  StudentCourse,
} from "../models/classroom.model";
import {
  studentCertificateAdapter,
  studentCourseAdapter,
} from "../adapters/classroom.adapter";
import { sessionAdapter } from "../adapters/classroom.adapter";
import type { Session } from "../models/classroom.model";
import type { SessionDTO } from "../dto/classroom.dto";
import type {
  StudentTestimonialBodyDTO,
  StudentTestimonialDTO,
} from "../dto/testimonial.dto";
import type { StudentTestimonial } from "../models/testimonial.model";
import { studentTestimonialAdapter } from "../adapters/testimonial.adapter";

/**
 * Endpoints del alumno.
 *
 * No extiende `BaseRepository`: no son CRUD sino agregaciones de solo lectura,
 * sin id, paginación ni filtros. Y ninguno recibe el documento del alumno — la
 * API lo deriva del token, así que no hay forma de pedir lo de otro.
 */
class StudentRepository {
  private route = "classroom/me";

  async courses(): Promise<ApiResponse<StudentCourse[]>> {
    const response = await apiFractal.get<StudentCourseDTO[]>(
      `${this.route}/courses`,
    );
    // `data` es `T | null`: sin la guarda, adaptar un null rompe en runtime.
    return { ...response, data: studentCourseAdapter.many(response.data ?? []) };
  }

  async course(id: number | string): Promise<ApiResponse<StudentCourse | null>> {
    const response = await apiFractal.get<StudentCourseDTO>(
      `${this.route}/courses/${id}`,
    );
    return {
      ...response,
      data: response.data ? studentCourseAdapter.one(response.data) : null,
    };
  }

  /** Clases del alumno en un rango. Sin rango, devuelve todas. */
  async agenda(params?: {
    from?: string;
    to?: string;
  }): Promise<ApiResponse<Session[]>> {
    const response = await apiFractal.get<SessionDTO[]>(`${this.route}/agenda`, {
      params,
    });
    return { ...response, data: (response.data ?? []).map(sessionAdapter) };
  }

  /** Avisos derivados de las tablas; el backend marca cuáles ya se leyeron. */
  async notifications(): Promise<ApiResponse<NotificationsDTO | null>> {
    return apiFractal.get<NotificationsDTO>(`${this.route}/notifications`);
  }

  /** Sin lista, el backend marca todos los pendientes. */
  async readNotifications(
    items?: NotificationDTO[],
  ): Promise<ApiResponse<unknown>> {
    return apiFractal.post(`${this.route}/notifications/read`, {
      items: items ?? [],
    });
  }

  async certificates(): Promise<ApiResponse<StudentCertificate[]>> {
    const response = await apiFractal.get<StudentCertificateDTO[]>(
      `${this.route}/certificates`,
    );
    return {
      ...response,
      data: studentCertificateAdapter.many(response.data ?? []),
    };
  }

  /**
   * Testimonio propio de un curso o línea, o null si todavía no lo dejó.
   * Exactamente uno de los dos ids: el backend rechaza mandar ambos.
   */
  async testimonial(
    params: { enrollmentCourseId?: number; enrollmentItemId?: number },
  ): Promise<ApiResponse<StudentTestimonial | null>> {
    const response = await apiFractal.get<StudentTestimonialDTO | null>(
      `${this.route}/testimonials`,
      {
        params: {
          enrollment_course_id: params.enrollmentCourseId,
          enrollment_item_id: params.enrollmentItemId,
        },
      },
    );
    return {
      ...response,
      data: response.data ? studentTestimonialAdapter(response.data) : null,
    };
  }

  /** Crea o edita (upsert) el testimonio propio. */
  async saveTestimonial(
    body: StudentTestimonialBodyDTO,
  ): Promise<ApiResponse<StudentTestimonial | null>> {
    const response = await apiFractal.post<StudentTestimonialDTO>(
      `${this.route}/testimonials`,
      body,
    );
    return {
      ...response,
      data: response.data ? studentTestimonialAdapter(response.data) : null,
    };
  }
}

export default new StudentRepository();
