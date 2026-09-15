import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { KpiDTO, KpiBodyDTO } from "../dto/kpi.dto";

export interface Kpi {
  /** El almacén es un JSON en S3: los ids llegan como string. */
  id: string;
  description: string;
  number: number;
  format: string;
  /** Vista previa del formato aplicado, ej. "+95%". */
  preview: string;
}

export interface KpiRepositoryTypes {
  base: RepositoryBase<Kpi, KpiDTO>;
  create: { body: KpiBodyDTO };
  update: { body: KpiBodyDTO };
}
