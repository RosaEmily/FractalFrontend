export interface Revenue {
  currency: string;
  symbol: string;
  name: string | null;
  total: number;
  count: number;
  /** Monto ya formateado por la API con el símbolo de `currencies`. */
  formatted: string;
  /** Variación vs. el mes previo; null si no hay base de comparación. */
  percent: number | null;
}

export interface Stats {
  revenue: Revenue[];
  enrollments: {
    current: number;
    previous: number;
    /** Diferencia absoluta contra el mes previo. */
    delta: number;
  };
  offers: {
    active: number;
    closingSoon: number;
  };
  approval: {
    total: number;
    approved: number;
    rate: number | null;
  };
}

export type AttentionSeverity = "critical" | "warning" | "info";

export interface AttentionItem {
  key: string;
  severity: AttentionSeverity;
  title: string;
  detail: string;
  count: number;
}

export type ClassSessionState = "done" | "in_progress" | "upcoming";

export interface ClassToday {
  id: number;
  name: string | null;
  topic: string | null;
  course: string;
  offer: string;
  prefix: string | null;
  teacher: string | null;
  meetLink: string | null;
  startTime: string | null;
  endTime: string | null;
  state: ClassSessionState;
}

export type QuotaState = "ok" | "below_min" | "over_max";

export interface Quota {
  id: number;
  name: string;
  prefix: string | null;
  enrolled: number;
  min: number;
  max: number;
  closesAt: string | null;
  state: QuotaState;
  /** % de ocupación sobre el máximo, tope 100 para la barra. */
  percent: number;
  /** Posición de la marca del mínimo dentro de la barra. */
  minPercent: number;
}
