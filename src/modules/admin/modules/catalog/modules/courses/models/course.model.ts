import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { CourseBodyDTO, CourseDTO } from "../dto/course.dto";

export interface Course {
  id: number;
  name: string;
  description: string | null;
  /** Precio formateado para mostrar en el listado. */
  price: string | null;
  /** Precio numérico para el formulario. */
  priceRaw: number | null;
  currencyId: number;
  imageUrl: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  tagIds: number[];
}

export interface CourseRepositoryTypes {
  base: RepositoryBase<Course, CourseDTO>;
  create: {
    body: CourseBodyDTO;
  };
  update: {
    body: CourseBodyDTO;
  };
}
