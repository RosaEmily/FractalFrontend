/** Monto cobrado en una moneda concreta. */
export interface RevenueDTO {
  currency: string;
  /** Símbolo y decimales vienen de la tabla `currencies`. */
  symbol: string;
  /** Nombre de la moneda ("Sol peruano"), de `currencies`. */
  name: string | null;
  decimals: number;
  total: number;
  count: number;
  /** Monto ya formateado por la API ("S/ 4,300.00"). */
  formatted: string;
}

export interface RevenueDeltaDTO {
  currency: string;
  symbol: string;
  /** null cuando no hay mes previo con el que comparar. */
  percent: number | null;
}

export interface StatsDTO {
  revenue: {
    current: RevenueDTO[];
    previous: RevenueDTO[];
    delta: RevenueDeltaDTO[];
  };
  enrollments: {
    current: number;
    previous: number;
  };
  offers: {
    active: number;
    closing_soon: number;
  };
  approval: {
    total: number;
    approved: number;
    /** null cuando todavía no hay notas finales cargadas. */
    rate: number | null;
  };
}

export type AttentionSeverityDTO = "critical" | "warning" | "info";

export interface AttentionItemDTO {
  key: string;
  severity: AttentionSeverityDTO;
  title: string;
  detail: string;
  count: number;
}

export type ClassSessionStateDTO = "done" | "in_progress" | "upcoming";

export interface ClassTodayDTO {
  id: number;
  name: string | null;
  topic: string | null;
  course: string;
  offer: string;
  prefix: string | null;
  teacher: string | null;
  meet_link: string | null;
  start_time: string | null;
  end_time: string | null;
  state: ClassSessionStateDTO;
}

export type QuotaStateDTO = "ok" | "below_min" | "over_max";

export interface QuotaDTO {
  id: number;
  name: string;
  prefix: string | null;
  enrolled: number;
  min: number;
  max: number;
  closes_at: string | null;
  state: QuotaStateDTO;
}
