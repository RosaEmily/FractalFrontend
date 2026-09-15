export interface EvaluationTypeDTO {
  id: number;
  name: string;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface EvaluationTypeBodyDTO {
  name: string | null;
  description: string | null;
}
