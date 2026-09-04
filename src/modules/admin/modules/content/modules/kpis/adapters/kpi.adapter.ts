import type { Kpi } from "../models/kpi.model";
import type { KpiDTO } from "../dto/kpi.dto";

/** El backend guarda el formato con el placeholder {n}, ej. "+{n}%". */
const applyFormat = (format: string, value: number): string =>
  (format ?? "").replace("{n}", String(value ?? ""));

export const kpiAdapter = {
  one: (dto: KpiDTO): Kpi => ({
    id: dto.id,
    description: dto.description,
    number: dto.number,
    format: dto.format,
    preview: applyFormat(dto.format, dto.number),
  }),

  many: (dtos: KpiDTO[]): Kpi[] => dtos.map((dto) => kpiAdapter.one(dto)),
};
