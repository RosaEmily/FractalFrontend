import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { TeacherDTO } from "../dto/teacher.dto";

export interface Teacher {
  /** `document_number` — se usa como identificador en `offer_courses.teacher_id`. */
  documentNumber: string;
  firstName: string;
  lastName: string;
  /** Nombre completo, listo para selects. */
  fullName: string;
  email: string;
  specialty: string | null;
  experienceYears: number;
  photoUrl: string | null;
  status: number;
}

export interface TeacherRepositoryTypes {
  base: RepositoryBase<Teacher, TeacherDTO>;
}
