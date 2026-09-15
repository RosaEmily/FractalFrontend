import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  EvaluationTypeDTO,
  EvaluationTypeBodyDTO,
} from "../dto/evaluation-type.dto";

export interface EvaluationType {
  id: number;
  name: string;
  description: string | null;
  status: number;
  updated_at: string;
}

export interface EvaluationTypeRepositoryTypes {
  base: RepositoryBase<EvaluationType, EvaluationTypeDTO>;
  create: { body: EvaluationTypeBodyDTO };
  update: { body: EvaluationTypeBodyDTO };
}
