/**
 * Contratos de coordinación.
 *
 * No hay endpoints propios: coordinación consume `dashboard` y `reports`, que
 * ya agregan sobre todas las cohortes. Estos tipos son los de esos endpoints.
 */

export interface AttentionItemDTO {
  /** Identifica el aviso; el front lo mapea a una ruta destino. */
  key: string;
  severity: string;
  title: string;
  detail: string;
  count: number;
}

export interface QuotaDTO {
  id: number;
  name: string;
  prefix: string | null;
  enrolled_students_count: number;
  min_students: number;
  max_students: number;
  enrollment_end_date: string | null;
  /** `over_max | below_min | ok`, derivado en el backend. */
  state: string;
}

export interface StatsDTO {
  /** Por moneda, nunca sumado: `transactions.currency` es texto libre. */
  revenue: {
    current: { currency: string; total: number }[];
    previous: { currency: string; total: number }[];
    delta: { currency: string; percent: number | null }[];
  };
  enrollments: { current: number; previous: number };
  offers: { active: number; closing_soon: number };
  /** `rate` es null sin notas, no 0: un 0% se leería como "todos desaprobaron". */
  approval: { total: number; approved: number; rate: number | null };
}

export interface ClassTodayDTO {
  id: number;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  topic: string | null;
  name: string | null;
  meet_link: string | null;
  status: number;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
  teacher_first_name: string | null;
  teacher_last_name: string | null;
  state: string;
}
