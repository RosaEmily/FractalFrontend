/*
 * Reportes de gerencia. Igual que el resto de reportes no llevan adapter: la API
 * ya devuelve los agregados, los porcentajes y los textos de cada monto
 * (`*_formatted`) con el símbolo y los decimales de `currencies`. La pantalla
 * solo pinta, y nunca suma montos de monedas distintas.
 */
export interface MoneyCurrencyDTO {
  currency: string | null;
  symbol: string | null;
  name: string | null;
  decimals: number;
}

// ── Resumen ejecutivo ────────────────────────────────────────────────
export interface ExecutiveCellDTO {
  enrollments: number;
  billed: number;
  collected: number;
  pending: number;
  cancelled: number;
  billed_formatted: string;
  collected_formatted: string;
  pending_formatted: string;
  cancelled_formatted: string;
}

export interface ExecutiveRowDTO {
  key: string;
  label: string;
  /** Qué incluye la fila: se muestra como ayuda junto al nombre. */
  hint: string;
  cells: Record<string, ExecutiveCellDTO>;
}

export interface ExecutiveReportDTO {
  generated_at: string;
  cutoff: string;
  period_from: string;
  currencies: MoneyCurrencyDTO[];
  rows: ExecutiveRowDTO[];
  total: ExecutiveRowDTO;
  kpis: {
    collected: (MoneyCurrencyDTO & {
      value: number;
      formatted: string;
      change_percent: number | null;
    })[];
    enrollments: { current: number; previous: number; change_percent: number | null };
    cohorts_below_min: number;
    overdue: (MoneyCurrencyDTO & { amount: number; count: number; formatted: string })[];
  };
  top_programs: (MoneyCurrencyDTO & {
    items: { offer_id: number; offer_name: string; enrollments: number; paid: number; formatted: string }[];
  })[];
  notes: string[];
}

// ── Antigüedad de la cobranza ────────────────────────────────────────
export type AgingBucketKey = "0_30" | "31_60" | "61_90" | "90_plus";

export interface AgingBucketDTO {
  amount: number;
  count: number;
  formatted: string;
  percent: number;
}

export interface AgingSummaryDTO extends MoneyCurrencyDTO {
  total: number;
  total_formatted: string;
  count: number;
  buckets: Record<AgingBucketKey, AgingBucketDTO>;
}

export interface AgingRowDTO extends MoneyCurrencyDTO {
  id: number;
  student: string;
  offers: string;
  amount: number;
  formatted: string;
  created_at: string;
  days: number;
}

export interface AgingReportDTO {
  totals: { enrollments: number; over_60: number; currencies: number };
  summary: AgingSummaryDTO[];
  items: AgingRowDTO[];
  detail_limit: number;
}

// ── Reclamos ─────────────────────────────────────────────────────────
export type ComplaintDueState = "overdue" | "due_soon" | "on_time";

export interface ComplaintRowDTO {
  id: number;
  code: string;
  type: string;
  name: string;
  state: string;
  due_at: string | null;
  created_at: string;
  days_left: number | null;
  due_state: ComplaintDueState;
}

export interface ComplaintsReportDTO {
  totals: {
    open: number;
    overdue: number;
    due_soon: number;
    on_time: number;
    answered_year: number;
    /** null cuando aún no hay reclamos respondidos. */
    average_response_days: number | null;
    answered_on_time_percent: number | null;
    due_soon_days: number;
  };
  items: ComplaintRowDTO[];
}

// ── Retención por cohorte ────────────────────────────────────────────
export interface RetentionRowDTO {
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  active: number;
  cancelled: number;
  failed: number;
  in_progress: number;
  completed: number;
  locked: number;
  enrolled: number;
  lost: number;
  dropout_percent: number | null;
  completion_percent: number | null;
}

export interface RetentionReportDTO {
  totals: {
    enrolled: number;
    lost: number;
    dropout_percent: number | null;
    completion_percent: number | null;
    cohorts: number;
  };
  items: RetentionRowDTO[];
}
