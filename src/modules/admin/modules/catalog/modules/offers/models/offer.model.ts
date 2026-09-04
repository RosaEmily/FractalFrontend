import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { OfferBodyDTO, OfferDTO, OfferType } from "../dto/offer.dto";

export interface OfferSchedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface OfferCourseItem {
  id?: number;
  courseId: number | null;
  name: string;
  teacherId: string | null;
  startDate: string | null;
  endDate: string | null;
  meetLink: string | null;
  schedules: OfferSchedule[];
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
