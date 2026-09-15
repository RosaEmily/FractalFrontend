export interface KpiDTO {
  id: string;
  description: string;
  number: number;
  format: string;
}

export interface KpiBodyDTO {
  description: string | null;
  number: number | null;
  format: string | null;
}
