/** Envoltorio común de todos los reportes: tarjetas + filas. */
export interface ReportDTO<T, K> {
  totals: K;
  items: T[];
}

// ── Ingresos y cobranza ──────────────────────────────────────────────
export interface RevenueRowDTO {
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  currency: string | null;
  symbol: string | null;
  enrollments: number;
  paid: number;
  pending: number;
  average: number;
  paid_percent: number;
}

export interface RevenueTotalsDTO {
  paid: number;
  pending: number;
  enrollments: number;
  average: number;
  pending_percent: number;
  offers: number;
}

// ── Matrículas por programa ──────────────────────────────────────────
export interface EnrollmentRowDTO {
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  type: "course" | "learning_path";
  active: number;
  paid: number;
  pending: number;
  cancelled: number;
  failed: number;
  paid_percent: number;
}

export interface EnrollmentTotalsDTO {
  active: number;
  paid: number;
  pending: number;
  cancelled: number;
  paid_percent: number;
  top_offer: { name: string; active: number } | null;
}

// ── Ocupación de cohortes ────────────────────────────────────────────
export interface OccupancyRowDTO {
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  enrolled: number;
  min: number;
  max: number;
  closes_at: string | null;
  state: "ok" | "below_min" | "over_max";
  percent: number;
  free: number;
}

export interface OccupancyTotalsDTO {
  offers: number;
  below_min: number;
  over_max: number;
  free: number;
}

// ── Rendimiento académico ────────────────────────────────────────────
export interface AcademicRowDTO {
  offer_course_id: number;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
  students: number;
  graded: number;
  approved: number;
  average: number | null;
  approved_percent: number | null;
}

export interface AcademicTotalsDTO {
  graded: number;
  approved: number;
  approved_percent: number | null;
  average: number | null;
  ungraded_courses: number;
}

// ── Certificados emitidos ────────────────────────────────────────────
export interface CertificateRowDTO {
  offer_course_id: number;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
  approved: number;
  issued: number;
  last_issued: string | null;
  pending: number;
  coverage: number | null;
}

export interface CertificateTotalsDTO {
  approved: number;
  issued: number;
  pending: number;
  coverage: number | null;
  up_to_date: number;
  courses: number;
}

// ── Asistencia ───────────────────────────────────────────────────────
export interface AttendanceRowDTO {
  offer_course_id: number;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
  sessions: number;
  students: number;
  present: number;
  late: number;
  absent: number;
  not_taken: number;
  marks: number;
  percent: number | null;
}

export interface AttendanceTotalsDTO {
  percent: number | null;
  sessions: number;
  not_taken: number;
  at_risk: number;
  risk_threshold: number;
}

/** Filtros que aceptan los endpoints. */
export interface ReportFilters {
  from?: string;
  to?: string;
  currency_id?: number;
  offer_id?: number;
  type?: "course" | "learning_path";
}
