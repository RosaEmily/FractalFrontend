export interface Student {
  /** La API usa document_number como primary key, no un id numérico. */
  document_number: string;
  document_type: string | null;
  /** "DNI 45211398" — tipo y número juntos, como en el diseño. */
  documentLabel: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  career: string | null;
  career_name: string | null;
  education_level: string | null;
  education_level_name: string | null;
  other_career: string | null;
  birth_date: string | null;
  birth_date_formatted: string | null;
  address: string | null;
  gender: "m" | "f" | "o" | null;
  is_favorite: number;
  status: number;
  updated_at: string;
}

import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { StudentDTO, StudentBodyDTO } from "../dto/student.dto";

export interface StudentRepositoryTypes {
  base: RepositoryBase<Student, StudentDTO>;
  create: { body: StudentBodyDTO };
  update: { body: StudentBodyDTO };
}
