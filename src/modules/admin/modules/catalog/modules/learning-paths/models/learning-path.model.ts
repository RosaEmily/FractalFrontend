import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  LearningPathBodyDTO,
  LearningPathDTO,
} from "../dto/learning-path.dto";

export interface LearningPathCourseItem {
  courseId: number;
  name: string;
  order: number;
}

export interface LearningPath {
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
  /** Nombres ordenados, para la columna del listado. */
  courses: string[];
  /** Cursos con id y orden, para el formulario. */
  courseItems: LearningPathCourseItem[];
  /** Solo los ids, en orden — es lo que consume el multiselect. */
  courseIds: number[];
}

export interface LearningPathRepositoryTypes {
  base: RepositoryBase<LearningPath, LearningPathDTO>;
  create: {
    body: LearningPathBodyDTO;
  };
  update: {
    body: LearningPathBodyDTO;
  };
}
