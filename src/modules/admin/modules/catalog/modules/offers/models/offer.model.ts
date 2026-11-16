import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { OfferBodyDTO, OfferDTO, OfferType } from "../dto/offer.dto";

export interface OfferSchedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  /**
   * Duración de la clase en minutos. SOLO de pantalla: la API recibe inicio y
   * fin (`toCourseItems` no la envía). Enlaza los dos: cambiarla mueve el fin.
   */
  durationMin?: number | null;
}

/** Unidad de la duración de un curso en el formulario. */
export type CourseDurationUnit = "weeks" | "months";

export interface OfferCourseItem {
  id?: number;
  courseId: number | null;
  name: string;
  teacherId: string | null;
  /**
   * Nombre del docente, para la vista de sesiones del programa.
   *
   * OPCIONAL: solo lo manda el detalle (`show`). Los formularios construyen
   * filas nuevas sin él, y exigirlo rompía el alta de cursos del programa.
   */
  teacherName?: string | null;
  startDate: string | null;
  endDate: string | null;
  meetLink: string | null;
  schedules: OfferSchedule[];
  /*
   * Campos SOLO del formulario de alta (no viajan a la API): con la duración
   * de cada curso se calculan sus fechas en cascada desde el inicio de clases.
   * `datesEdited` marca que el admin tocó las fechas a mano y ya no se recalculan.
   */
  durationValue?: number | null;
  durationUnit?: CourseDurationUnit;
  datesEdited?: boolean;
}

export interface Offer {
  id: number;
  name: string;
  prefix: string | null;
  type: OfferType;
  typeLabel: string;
  learningPathId: number | null;
  learningPathName: string | null;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  minStudents: number;
  maxStudents: number;
  enrolledStudentsCount: number;
  /** Cupo ocupado/total, listo para la columna del listado. */
  seats: string;
  /** Rango de matrícula ya formateado para la lista. */
  enrollmentRange: string;
  price: string | null;
  priceRaw: number | null;
  currencyId: number;
  imageUrl: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  courseItems: OfferCourseItem[];
}

export interface OfferRepositoryTypes {
  base: RepositoryBase<Offer, OfferDTO>;
  create: {
    body: OfferBodyDTO;
  };
  update: {
    body: OfferBodyDTO;
  };
}
