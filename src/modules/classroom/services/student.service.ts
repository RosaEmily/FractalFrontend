import studentRepository from "../repositories/student.repository";
import type {
  NotificationDTO,
  NotificationsDTO,
} from "../dto/classroom.dto";
import type {
  Session,
  StudentCertificate,
  StudentCourse,
} from "../models/classroom.model";

/**
 * Servicio del alumno.
 *
 * Los agregados académicos (nota proyectada, % de asistencia, avance, estado)
 * los calcula el backend: acá solo se agrupa lo que las pantallas consumen
 * junto, para no repetir la misma reducción en cada vista.
 */
class StudentService {
  async courses(): Promise<StudentCourse[]> {
    const response = await studentRepository.courses();
    return response.data ?? [];
  }

  async course(id: number | string): Promise<StudentCourse | null> {
    const response = await studentRepository.course(id);
    return response.data;
  }

  async agenda(params?: { from?: string; to?: string }): Promise<Session[]> {
    const response = await studentRepository.agenda(params);
    return response.data ?? [];
  }

  async notifications(): Promise<NotificationsDTO | null> {
    const response = await studentRepository.notifications();
    return response.data;
  }

  async readNotifications(items?: NotificationDTO[]): Promise<boolean> {
    const response = await studentRepository.readNotifications(items);
    return response.success;
  }

  async certificates(): Promise<StudentCertificate[]> {
    const response = await studentRepository.certificates();
    return response.data ?? [];
  }
}

export default new StudentService();

/**
 * Cursos agrupados por oferta, para la pantalla de líneas de carrera.
 *
 * Una línea es una oferta de tipo `learning_path` con sus cursos ordenados; un
 * curso suelto es una oferta de tipo `course`. La API devuelve la lista plana
 * porque es lo que necesitan las otras pantallas, así que el agrupamiento vive
 * acá y no en el template.
 */
export interface LearningPathGroup {
  offerId: number;
  offerName: string;
  offerPrefix: string | null;
  offerType: string;
  courses: StudentCourse[];
  total: number;
  done: number;
  percent: number;
  completed: boolean;
  /** Primer curso en curso, o null si la línea está cerrada o bloqueada. */
  current: StudentCourse | null;
}

export const groupByOffer = (courses: StudentCourse[]): LearningPathGroup[] => {
  const groups = new Map<number, StudentCourse[]>();

  courses.forEach((course) => {
    const list = groups.get(course.offerId) ?? [];
    list.push(course);
    groups.set(course.offerId, list);
  });

  return [...groups.entries()].map(([offerId, list]) => {
    const done = list.filter((c) => c.progressStatus === "completed").length;
    // El grupo nace de al menos un curso, pero TS no puede saberlo.
    const first = list[0] as StudentCourse;

    return {
      offerId,
      offerName: first.offerName,
      offerPrefix: first.offerPrefix,
      offerType: first.offerType,
      courses: list,
      total: list.length,
      done,
      // `total` nunca es 0 acá: el grupo nace de al menos un curso.
      percent: Math.round((done / list.length) * 100),
      completed: done === list.length,
      current: list.find((c) => c.progressStatus === "in_progress") ?? null,
    };
  });
};
